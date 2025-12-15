import { renderEditTask } from "../editTask/editTask";
import { showTasksOnMap, setOnTaskCoordsDraftChange } from "../../map/map";
import type {
  Env,
  MissionTask,
  RemoteScenario,
  ScenarioType,
} from "../../../types/types";

type ScenarioEditorCallbacks = {
  onClose?: () => void;
};

type TaskLookup = Map<number, MissionTask>;

type Difficulty = MissionTask["difficulty"];

const allowedDifficulties: Difficulty[] = ["Let", "Øvet", "Svær"];

function envToScenarioType(env: Env): ScenarioType {
  return env === "land" ? "Land" : "Sø";
}

function toDifficulty(value: string | undefined): Difficulty {
  const candidate = (value ?? "").trim();
  return allowedDifficulties.includes(candidate as Difficulty)
    ? (candidate as Difficulty)
    : "Let";
}

function convertTasks(scenario: RemoteScenario): TaskLookup {
  const tasks = scenario.tasks ?? [];
  const fallbackCenter = scenario.map?.center ?? {
    lat: 55.6761,
    lng: 12.5683,
  };
  const taskType = envToScenarioType(scenario.type);

  const lookup: TaskLookup = new Map();

  tasks.forEach((task, index) => {
    const id = Number(task.taskId ?? index + 1);
    const geo = task.geo ?? {
      lat: fallbackCenter.lat,
      lng: fallbackCenter.lng,
      radius: 50,
    };

    lookup.set(id, {
      id: id,
      title: task.title ?? `Opgave ${index + 1}`,
      description: task.description ?? "",
      type: taskType,
      location: task.locationName ?? "",
      radius: Number.isFinite(geo.radius) ? geo.radius : 50,
      options: Array.isArray(task.options) ? [...task.options] : [],
      activationCondition: task.activationCondition ?? "",
      activated: false,
      completed: false,
      difficulty: toDifficulty(task.difficulty),
      latitude: geo.lat,
      longitude: geo.lng,
    });
  });

  return lookup;
}

function renderTaskList(
  container: HTMLElement,
  tasks: TaskLookup,
  selectedId: number | null
) {
  const all = Array.from(tasks.values());

  if (!all.length) {
    container.innerHTML = `<p>Ingen opgaver fundet i scenariet.</p>`;
    return;
  }

  container.innerHTML = all
    .map(
      (task) => `
        <button
          type="button"
          class="py-2 scenario-task-badge${
            selectedId === task.id ? " is-active" : ""
          }"
          data-id="${task.id}"
        >
            <i class="icon icon-edit" aria-hidden="true"></i>
          ${task.title}
  
        </button>
      `
    )
    .join("");
}

function refreshMap(tasks: TaskLookup) {
  const all = Array.from(tasks.values());
  showTasksOnMap(all);
}

export function renderScenarioEditor(
  host: HTMLDivElement,
  scenario: RemoteScenario,
  callbacks: ScenarioEditorCallbacks = {}
): void {
  const tasks = convertTasks(scenario);
  refreshMap(tasks);

  host.innerHTML = `
    <div class="scenario-edit-header">
      <div class="scenario-edit-header-bar">
        <h4 class="mb-4">Redigér scenarie</h4>
      </div>
      <p class="text-muted mb-5">
        ${scenario.title ?? "Uden titel"} – ${
    scenario.type === "land" ? "Land" : "Sø"
  } 
      </p>
    </div>
    <div class="scenario-edit-body">
      <div class="scenario-edit-tasks" id="scenario-edit-task-list"></div>
      <div class="scenario-edit-detail" id="scenario-edit-task-detail">
        <p>Vælg en opgave for at redigere detaljer.</p>
      </div>
    </div>
  `;

  const listHost = host.querySelector<HTMLDivElement>(
    "#scenario-edit-task-list"
  );
  const detailHost = host.querySelector<HTMLDivElement>(
    "#scenario-edit-task-detail"
  );

  if (!listHost || !detailHost) {
    callbacks.onClose?.();
    return;
  }

  let activeTaskId: number | null = null;

  const mountTaskDetail = (
    task: MissionTask,
    options?: { preserveFocus?: boolean }
  ) => {
    const shouldPreserve = Boolean(options?.preserveFocus);
    const activeElement = shouldPreserve
      ? detailHost.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null
      : null;
    const activeId = activeElement?.id ?? null;

    activeTaskId = task.id;
    renderTaskList(listHost, tasks, activeTaskId);

    renderEditTask(
      detailHost,
      { ...task },
      {
        onChange: (updated) => {
          tasks.set(updated.id, { ...updated });
          renderTaskList(listHost, tasks, activeTaskId);
          detailHost.scrollIntoView({ behavior: "smooth", block: "start" });
          refreshMap(tasks);
        },
        onDelete: (taskId) => {
          tasks.delete(taskId);
          if (activeTaskId === taskId) {
            activeTaskId = null;
            detailHost.innerHTML = `<p>Opgaven er fjernet. Vælg en anden opgave.</p>`;
          }
          renderTaskList(listHost, tasks, activeTaskId);
          refreshMap(tasks);
        },
      }
    );

    if (shouldPreserve && activeId) {
      const next = detailHost.querySelector<HTMLElement>(`#${activeId}`);
      if (next) {
        next.focus();
        if (next instanceof HTMLInputElement && next.type !== "number") {
          const length = next.value.length;
          next.setSelectionRange(length, length);
        } else if (next instanceof HTMLTextAreaElement) {
          const length = next.value.length;
          next.setSelectionRange(length, length);
        }
      }
    }
  };

  const handleCoordsDraftChange = (
    taskId: number,
    lat: number,
    lng: number
  ) => {
    const current = tasks.get(taskId);
    if (!current) return;

    const updated: MissionTask = { ...current, latitude: lat, longitude: lng };
    tasks.set(taskId, updated);

    refreshMap(tasks);

    if (activeTaskId === taskId) {
      mountTaskDetail(updated, { preserveFocus: true });
    } else {
      renderTaskList(listHost, tasks, activeTaskId);
    }
  };

  setOnTaskCoordsDraftChange(handleCoordsDraftChange);

  renderTaskList(listHost, tasks, activeTaskId);

  listHost.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      ".scenario-task-badge"
    );
    if (!button) return;

    const id = Number(button.dataset.id);
    const task = tasks.get(id);
    if (!task) return;

    mountTaskDetail(task);
  });
}
