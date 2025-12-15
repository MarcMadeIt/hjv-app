import "./editTask.css";
import type { MissionTask } from "../../../types/types";

interface TaskDetailCallbacks {
  onChange: (updated: MissionTask) => void;
  onDelete: (taskId: number) => void;
}

export function renderEditTask(
  host: HTMLDivElement,
  task: MissionTask,
  callbacks: TaskDetailCallbacks
): void {
  const draft: MissionTask = { ...task };

  host.innerHTML = `
    <div id="task-detail-form">
      <div class="task-form-group">
        <label class="form-label" for="task-name">Navn</label>
        <input
          type="text"
          id="task-name"
          name="task-name"
          class="form-input"
          required
          value="${draft.title}"
        >
      </div>

      <div class="task-form-group">
        <label class="form-label" for="task-lat">Latitude</label>
        <input
          type="number"
          id="task-lat"
          name="task-lat"
          class="form-input"
          step="0.0001"
          value="${draft.latitude}"
        >
      </div>

      <div class="task-form-group">
        <label class="form-label" for="task-lon">Longitude</label>
        <input
          type="number"
          id="task-lon"
          name="task-lon"
          class="form-input"
          step="0.0001"
          value="${draft.longitude}"
        >
      </div>

      <div class="task-form-group">
        <label class="form-label" for="task-desc">Beskrivelse</label>
        <textarea
          class="form-input"
          id="task-desc"
          name="task-desc"
          rows="5"
          required
        >${draft.description}</textarea>
      </div>

      <div class="task-form-group">
        <button type="button" class="button button-secondary" id="delete-task">
          Slet opgave
        </button>
      </div>
    </div>
  `;

  const nameInput = host.querySelector<HTMLInputElement>("#task-name");
  const latInput = host.querySelector<HTMLInputElement>("#task-lat");
  const lonInput = host.querySelector<HTMLInputElement>("#task-lon");
  const descInput = host.querySelector<HTMLTextAreaElement>("#task-desc");
  const deleteBtn = host.querySelector<HTMLButtonElement>("#delete-task");

  if (!nameInput || !latInput || !lonInput || !descInput || !deleteBtn) return;

  const notify = () => callbacks.onChange({ ...draft });

  nameInput.addEventListener("input", () => {
    draft.title = nameInput.value;
    notify();
  });

  latInput.addEventListener("input", () => {
    draft.latitude = parseFloat(latInput.value);
    notify();
  });

  lonInput.addEventListener("input", () => {
    draft.longitude = parseFloat(lonInput.value);
    notify();
  });

  descInput.addEventListener("input", () => {
    draft.description = descInput.value;
    notify();
  });

  deleteBtn.addEventListener("click", () => {
    callbacks.onDelete(draft.id);
  });
}
