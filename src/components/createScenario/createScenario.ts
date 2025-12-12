import "./createScenario.css";
import type { MissionTask, ScenarioType } from "../../types/types";
import { fetchTasks } from "./helpers/fetchTasks";
import { focusTaskOnMap, showTasksOnMap } from "../map/map";
import { renderChooseTasks } from "./chooseTasks/chooseTasks";
import saveScenarioToJsonBin from "./helpers/saveScenario";

let tasksCache: MissionTask[] | null = null;

async function loadTasks(): Promise<MissionTask[]> {
  if (!tasksCache) {
    const res = await fetchTasks();
    tasksCache = res;
  }
  return tasksCache;
}

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
  const selectedTaskIdsByType = new Map<ScenarioType, Set<number>>();
  let currentType: ScenarioType | null = null;

  host.innerHTML = `
    <form id="scenario-form" action="">
      <div id="scenario-shell" class="content-view">
        <div class="scenario-form-group">
          <label class="form-label" for="scenario-name">Titel på Scenarie</label>
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

        <div id="choose-tasks-container"></div>
        <div id="tasks-list"></div>
        <div class="scenario-form-group">
          <label class="form-label" for="scenario-desc">Beskrivelse</label>
          <textarea class="form-input" id="scenario-desc" name="scenario-desc" rows="5" required></textarea>
        </div>

        </div>
        <div class="mb-7">
          <button type="button" class="button button-primary" id="save-scenario-btn">
            Gem scenarie
          </button>
        </div>
      </div>
      <div id="task-detail-view" class="content-view" style="display:none;"></div>
    </form>
  `;

  const radios = host.querySelectorAll<HTMLInputElement>(
    'input[name="scenario-type"]'
  );
  const scenarioShell = host.querySelector<HTMLDivElement>("#scenario-shell");
  const taskDetailView =
    host.querySelector<HTMLDivElement>("#task-detail-view");
  const tasksList = host.querySelector<HTMLDivElement>("#tasks-list");
  const scenarioNameInput =
    host.querySelector<HTMLInputElement>("#scenario-name");
  const scenarioDescInput =
    host.querySelector<HTMLTextAreaElement>("#scenario-desc");
  const chooseTasksContainer = host.querySelector<HTMLDivElement>(
    "#choose-tasks-container"
  );
  const saveScenarioBtn =
    host.querySelector<HTMLButtonElement>("#save-scenario-btn");

  if (
    !tasksList ||
    !taskDetailView ||
    !scenarioShell ||
    !scenarioNameInput ||
    !scenarioDescInput ||
    !chooseTasksContainer ||
    !saveScenarioBtn
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

  function getSelectedSet(type: ScenarioType): Set<number> {
    let set = selectedTaskIdsByType.get(type);
    if (!set) {
      set = new Set<number>();
      selectedTaskIdsByType.set(type, set);
    }
    return set;
  }

  async function buildTaskMapForType(
    type: ScenarioType
  ): Promise<Map<number, MissionTask>> {
    const all = await loadTasks();
    const deleted = getDeletedSet(type);

    const base = all.filter((t) => t.Type === type && !deleted.has(t.ID));
    const draftsForType = Array.from(taskDrafts.values()).filter(
      (t) => t.Type === type
    );

    const byId = new Map<number, MissionTask>();
    base.forEach((t) => byId.set(t.ID, { ...t }));
    draftsForType.forEach((t) => byId.set(t.ID, { ...t }));

    return byId;
  }

  async function getAvailableTasks(type: ScenarioType): Promise<MissionTask[]> {
    const map = await buildTaskMapForType(type);
    return Array.from(map.values()).map((task) => ({ ...task }));
  }

  async function getCurrentTasks(
    type: ScenarioType | null
  ): Promise<MissionTask[]> {
    if (!type) return [];
    const map = await buildTaskMapForType(type);
    const selected = getSelectedSet(type);

    if (!selected.size) {
      return [];
    }

    const missing: number[] = [];
    const result: MissionTask[] = [];

    selected.forEach((id) => {
      const task = map.get(id);
      if (task) {
        result.push({ ...task });
      } else {
        missing.push(id);
      }
    });

    if (missing.length) {
      missing.forEach((id) => selected.delete(id));
    }

    return result;
  }

  const chooseTasks = renderChooseTasks(chooseTasksContainer, {
    requestTasks: (type) => getAvailableTasks(type),
    onApplySelection: (type, selection) => {
      const set = getSelectedSet(type);
      set.clear();
      selection.forEach((id) => set.add(id));

      if (currentType === type) {
        renderTasks(type);
      }
    },
  });

  chooseTasks.setScenarioType(null, new Set<number>());

  async function renderTasks(type: ScenarioType) {
    const currentTasks = await getCurrentTasks(type);

    if (!tasksList || !taskDetailView || !scenarioShell) return;

    if (!currentTasks.length) {
      const selected = getSelectedSet(type);
      if (selected.size) {
        tasksList.innerHTML = `<p>Ingen opgaver tilgængelige for typen "${type}".</p>`;
      } else {
        tasksList.innerHTML = `<p>Ingen opgaver valgt. Brug "Vælg opgaver" for at tilføje.</p>`;
      }
      showTasksOnMap([]);
      chooseTasks.refresh(type, new Set(selected)).catch(() => void 0);
      return;
    }

    tasksList.innerHTML = currentTasks
      .map(
        (t) => `
        
        <strong
          type="button"
          class="badge badge-success badge-task"
          data-id="${t.ID}"
        ><i class="icon icon-check" aria-hidden="true"></i>
          ${t.Title}
        </strong>
      `
      )
      .join("");

    showTasksOnMap(currentTasks);

    chooseTasks
      .refresh(type, new Set(getSelectedSet(type)))
      .catch(() => void 0);
    /*
    tasksList.onclick = (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>(".task-btn");
      if (!button) return;

      const id = Number(button.dataset.id);
      const task = currentTasks.find((t) => t.ID === id);
      if (!task) return;

      scenarioShell.style.display = "none";
      taskDetailView.style.display = "";
*/

    tasksList.onclick = (event) => {
      const target = event.target as HTMLElement;
      const badge = target.closest<HTMLElement>(".badge-task");
      if (!badge) return;

      const id = Number(badge.dataset.id);
      const task = currentTasks.find((t) => t.ID === id);
      if (!task) return;

      /* scenarioShell.style.display = "none";*/
      taskDetailView.style.display = "";

      focusTaskOnMap(task);

      /*
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

      renderEditTask(detailHost, task, {
        onChange: (updated) => {
          taskDrafts.set(updated.ID, updated);

          const btn = tasksList.querySelector<HTMLButtonElement>(
            `button[data-id="${updated.ID}"]`
          );
          if (btn) {
            btn.textContent = updated.Title;
          }

          if (currentType === updated.Type) {
            chooseTasks
              .refresh(updated.Type, new Set(getSelectedSet(updated.Type)))
              .catch(() => void 0);
          }
        },
        onDelete: (taskId) => {
          if (!currentType) return;
          const deletedSet = getDeletedSet(currentType);
          deletedSet.add(taskId);
          taskDrafts.delete(taskId);

          const selectedSet = getSelectedSet(currentType);
          selectedSet.delete(taskId);

          chooseTasks
            .refresh(currentType, new Set(selectedSet))
            .catch(() => void 0);

          scenarioShell.style.display = "";
          taskDetailView.style.display = "none";

          renderTasks(currentType);
        },
      });

      backBtn.addEventListener("click", () => {
        scenarioShell.style.display = "";
        taskDetailView.style.display = "none";
        if (currentType) {
          renderTasks(currentType);
        }
      }); */
    };
  }

  /*addTaskBtn.addEventListener("click", async () => {
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

    const selectedSet = getSelectedSet(currentType);
    selectedSet.add(newTask.ID);

    chooseTasks.refresh(currentType, new Set(selectedSet)).catch(() => void 0);

    await renderTasks(currentType);

    const btn = tasksList.querySelector<HTMLButtonElement>(
      `button[data-id="${newTask.ID}"]`
    );
    if (btn) {
      btn.click();
    }
  });*/

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
      const selectedSet = getSelectedSet(value);
      selectedSet.clear();

      tasksList.innerHTML = "";
      taskDetailView.style.display = "none";
      scenarioShell.style.display = "";

      chooseTasks.setScenarioType(value, new Set(selectedSet));
      renderTasks(value);
    });
  });

  saveScenarioBtn.addEventListener("click", async () => {
    try {
      const tasks = await getCurrentTasks(currentType);
      await saveScenarioToJsonBin(currentType, scenarioDraft, tasks);
    } catch (e) {
      console.error(e);
    }
  });
}
