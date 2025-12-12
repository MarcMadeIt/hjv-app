import "./createScenario.css";
import type { MissionTask } from "../../types/types";
import { renderCreateTask } from "../createTask/createTask";
import { fetchTasks } from "./helpers/fetchTasks";
import { focusTaskOnMap, showTasksOnMap } from "../map/map";

let tasksCache: MissionTask[] | null = null;
let nextId = 1000;

async function loadTasks(): Promise<MissionTask[]> {
  if (!tasksCache) {
    const res = await fetchTasks();
    tasksCache = res;
  }
  return tasksCache;
}

type ScenarioType = "Land" | "Sø";

interface ScenarioDraft {
  type: ScenarioType | null;
  name: string;
  description: string;
}

export function renderCreateScenario(host: HTMLDivElement): void {
  let scenarioDraft: ScenarioDraft = {
    type: null,
    name: "",
    description: "",
  };

  const taskDrafts = new Map<number, MissionTask>();
  const deletedTaskIdsByType = new Map<ScenarioType, Set<number>>();
  let currentType: ScenarioType | null = null;

  host.innerHTML = `
    <form id="scenario-form" action="">
      <div id="scenario-view">
        <div class="scenario-form-group">
          <label class="form-label" for="scenario-name">Navn</label>
          <input type="text" id="scenario-name" name="scenario-name" class="form-input" required>
        </div>

        <div class="scenario-form-group">
          <fieldset aria-labelledby="scenario-type-legend">
            <legend class="form-label" id="scenario-type-legend">Vælg type</legend>
            <div id="radio-options">
              <div class="form-group-radio">
                <input type="radio" id="scenario-type-land" name="scenario-type" class="form-radio" value="Land">
                <label class="form-label" for="scenario-type-land">Land</label>
              </div>
              <div class="form-group-radio">
                <input type="radio" id="scenario-type-sea" name="scenario-type" class="form-radio" value="Sø">
                <label class="form-label" for="scenario-type-sea">Sø</label>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="scenario-form-group">
          <label class="form-label" for="scenario-desc">Beskrivelse</label>
          <textarea class="form-input" id="scenario-desc" name="scenario-desc" rows="5" required></textarea>
        </div>

        <div class="scenario-form-group">
          <div class="mb-7">
            <button type="button" class="button button-primary" id="add-task-btn">
              Opret ny opgave
            </button>
          </div>
          <label class="form-label">Opgaver</label>
          <div id="tasks-list"></div>
        </div>
      </div>

      <div id="task-detail-view" style="display:none;"></div>
    </form>
  `;

  const radios = host.querySelectorAll<HTMLInputElement>(
    'input[name="scenario-type"]'
  );
  const scenarioView = host.querySelector<HTMLDivElement>("#scenario-view");
  const taskDetailView =
    host.querySelector<HTMLDivElement>("#task-detail-view");
  const tasksList = host.querySelector<HTMLDivElement>("#tasks-list");
  const scenarioNameInput =
    host.querySelector<HTMLInputElement>("#scenario-name");
  const scenarioDescInput =
    host.querySelector<HTMLTextAreaElement>("#scenario-desc");
  const addTaskBtn = host.querySelector<HTMLButtonElement>("#add-task-btn");

  if (
    !tasksList ||
    !taskDetailView ||
    !scenarioView ||
    !scenarioNameInput ||
    !scenarioDescInput ||
    !addTaskBtn
  ) {
    return;
  }

  scenarioNameInput.addEventListener("input", () => {
    scenarioDraft.name = scenarioNameInput.value;
  });

  scenarioDescInput.addEventListener("input", () => {
    scenarioDraft.description = scenarioDescInput.value;
  });

  function getDeletedSet(type: ScenarioType): Set<number> {
    let set = deletedTaskIdsByType.get(type);
    if (!set) {
      set = new Set<number>();
      deletedTaskIdsByType.set(type, set);
    }
    return set;
  }

  async function getCurrentTasks(type: ScenarioType): Promise<MissionTask[]> {
    const all = await loadTasks();
    const deleted = getDeletedSet(type);

    const base = all.filter((t) => t.Type === type && !deleted.has(t.ID));
    const draftsForType = Array.from(taskDrafts.values()).filter(
      (t) => t.Type === type
    );

    const byId = new Map<number, MissionTask>();
    base.forEach((t) => byId.set(t.ID, { ...t }));
    draftsForType.forEach((t) => byId.set(t.ID, { ...t })); // overrides + new

    return Array.from(byId.values());
  }

  async function renderTasks(type: ScenarioType) {
    const currentTasks = await getCurrentTasks(type);

    if (!tasksList || !taskDetailView || !scenarioView) return;

    if (!currentTasks.length) {
      tasksList.innerHTML = `<p>Ingen opgaver af typen "${type}".</p>`;
      showTasksOnMap([]);
      return;
    }

    tasksList.innerHTML = currentTasks
      .map(
        (t) => `
        <button
          type="button"
          class="button button-secondary task-btn xs-full-width"
          data-id="${t.ID}"
        >
          ${t.Title}
        </button>
      `
      )
      .join("");

    showTasksOnMap(currentTasks);

    tasksList.onclick = (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>(".task-btn");
      if (!button) return;

      const id = Number(button.dataset.id);
      const task = currentTasks.find((t) => t.ID === id);
      if (!task) return;

      scenarioView.style.display = "none";
      taskDetailView.style.display = "block";

      taskDetailView.innerHTML = `
        <button type="button" class="button button-tertiary mb-4" id="back-to-scenario">
          Tilbage til scenarie
        </button>
        <div id="task-detail"></div>
      `;

      const backBtn =
        taskDetailView.querySelector<HTMLButtonElement>("#back-to-scenario");
      const detailHost =
        taskDetailView.querySelector<HTMLDivElement>("#task-detail");
      if (!backBtn || !detailHost) return;

      focusTaskOnMap(task);

      renderCreateTask(detailHost, task, {
        onChange: (updated) => {
          taskDrafts.set(updated.ID, updated);

          const btn = tasksList.querySelector<HTMLButtonElement>(
            `button[data-id="${updated.ID}"]`
          );
          if (btn) {
            btn.textContent = updated.Title;
          }
        },
        onDelete: (taskId) => {
          if (!currentType) return;
          const deletedSet = getDeletedSet(currentType);
          deletedSet.add(taskId);
          taskDrafts.delete(taskId);

          scenarioView.style.display = "block";
          taskDetailView.style.display = "none";

          renderTasks(currentType);
        },
      });

      backBtn.addEventListener("click", () => {
        scenarioView.style.display = "block";
        taskDetailView.style.display = "none";
        if (currentType) {
          renderTasks(currentType);
        }
      });
    };
  }

  addTaskBtn.addEventListener("click", async () => {
    if (!currentType) return;

    const newTask: MissionTask = {
      ID: nextId++,
      Title: "Ny opgave",
      Description: "",
      Type: currentType,
      Location: "",
      Radius: 50,
      Options: [],
      ActivationCondition: "Lokalitet",
      Activate: false,
      Completed: false,
      Difficulty: "Let",
      Latitude: 55.6,
      Longitude: 8.3,
    };

    taskDrafts.set(newTask.ID, newTask);

    await renderTasks(currentType);

    const btn = tasksList.querySelector<HTMLButtonElement>(
      `button[data-id="${newTask.ID}"]`
    );
    if (btn) {
      btn.click();
    }
  });

  radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const value = (e.target as HTMLInputElement).value as ScenarioType;

      scenarioDraft = {
        type: value,
        name: "",
        description: "",
      };
      currentType = value;

      scenarioNameInput.value = "";
      scenarioDescInput.value = "";

      taskDrafts.clear();
      const deletedSet = getDeletedSet(value);
      deletedSet.clear();

      tasksList.innerHTML = "";
      taskDetailView.style.display = "none";
      scenarioView.style.display = "block";

      renderTasks(value);
    });
  });

  // Note from Nina: here im gonna send the data once its ready
}
