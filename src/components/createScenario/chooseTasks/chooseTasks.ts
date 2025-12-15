import type { MissionTask } from "../../../types/types";

type ScenarioType = MissionTask["Type"];

interface ChooseTasksOptions {
  requestTasks: (type: ScenarioType) => Promise<MissionTask[]>;
  onApplySelection: (type: ScenarioType, selection: Set<number>) => void;
}

interface ChooseTasksController {
  setScenarioType(type: ScenarioType | null, selected: Set<number>): void;
  refresh(type: ScenarioType, selected: Set<number>): Promise<void>;
}

const NO_TYPE_MESSAGE = "Vælg scenarietype for at vælge opgaver";

export function renderChooseTasks(
  host: HTMLDivElement,
  options: ChooseTasksOptions
): ChooseTasksController {
  host.innerHTML = `
		<div class="choose-tasks">
			<button type="button" class="button button-secondary" id="choose-tasks-open" disabled>
				Vælg opgaver
			</button>
			<p class="table-selected-number no-selected" id="choose-tasks-summary">${NO_TYPE_MESSAGE}</p>
			<dialog id="choose-tasks-modal" class="choose-tasks-modal">
				<form method="dialog" class="choose-tasks-modal-form">
					<header class="choose-tasks-modal-header">
						<h2 class="modal-title">Vælg opgaver</h2>
						<p id="choose-tasks-type"></p>
					</header>
					<div class="table--responsive-scroll" tabindex="0">
						<table class="table table--selectable" id="choose-tasks-table">
							<thead>
								<tr>
									<th>
										<div class="form-group-checkbox">
											<input id="choose-tasks-check-all" type="checkbox" class="form-checkbox">
											<label for="choose-tasks-check-all"><span class="sr-only">Vælg alle rækker</span></label>
										</div>
									</th>
									<th scope="col">Navn</th>
									<th scope="col">Beskrivelse</th>
									<th scope="col">Sværhedsgrad</th>
									<th scope="col">Koordinater</th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>
					</div>
					<div class="table-actions">
						<p class="table-selected-number no-selected" id="choose-tasks-count">Ingen rækker valgt</p>
						<div class="button-group">
							<button type="button" class="button button-primary" id="choose-tasks-apply">
								<svg class="icon-svg" focusable="false" aria-hidden="true"><use href="#download"></use></svg>
								Tilføj valgte
							</button>
							<button type="button" class="button button-secondary" id="choose-tasks-cancel">
								<svg class="icon-svg" focusable="false" aria-hidden="true"><use href="#delete"></use></svg>
								Annuller
							</button>
						</div>
					</div>
				</form>
			</dialog>
		</div>
	`;

  const requireElement = <T extends Element>(
    element: T | null,
    message: string
  ): T => {
    if (!element) {
      throw new Error(message);
    }
    return element;
  };

  const modal = requireElement(
    host.querySelector<HTMLDialogElement>("#choose-tasks-modal"),
    "Choose tasks modal element is missing"
  );
  const openBtn = requireElement(
    host.querySelector<HTMLButtonElement>("#choose-tasks-open"),
    "Choose tasks open button is missing"
  );
  const summaryEl = requireElement(
    host.querySelector<HTMLParagraphElement>("#choose-tasks-summary"),
    "Choose tasks summary element is missing"
  );
  const typeLabel = requireElement(
    host.querySelector<HTMLParagraphElement>("#choose-tasks-type"),
    "Choose tasks type label is missing"
  );
  const tableBody = requireElement(
    host.querySelector<HTMLTableSectionElement>("#choose-tasks-table tbody"),
    "Choose tasks table body is missing"
  );
  const checkAll = requireElement(
    host.querySelector<HTMLInputElement>("#choose-tasks-check-all"),
    "Choose tasks select-all checkbox is missing"
  );
  const countEl = requireElement(
    host.querySelector<HTMLParagraphElement>("#choose-tasks-count"),
    "Choose tasks count element is missing"
  );
  const applyBtn = requireElement(
    host.querySelector<HTMLButtonElement>("#choose-tasks-apply"),
    "Choose tasks apply button is missing"
  );
  const cancelBtn = requireElement(
    host.querySelector<HTMLButtonElement>("#choose-tasks-cancel"),
    "Choose tasks cancel button is missing"
  );

  let currentType: ScenarioType | null = null;
  let currentSelection = new Set<number>();
  let currentTasks: MissionTask[] = [];
  const selectionCountByType = new Map<ScenarioType, number>();

  const isDialogSupported = typeof modal.showModal === "function";

  function isModalOpen(): boolean {
    if (isDialogSupported) {
      return modal.open;
    }
    return modal.getAttribute("data-open") === "true";
  }

  function openModal() {
    if (!currentType) {
      return;
    }
    if (isDialogSupported) {
      if (!modal.open) {
        modal.showModal();
      }
    } else {
      modal.setAttribute("data-open", "true");
      modal.style.display = "block";
    }
  }

  function closeModal() {
    if (isDialogSupported) {
      if (modal.open) {
        modal.close();
      }
    } else {
      modal.removeAttribute("data-open");
      modal.style.display = "none";
    }
  }

  function updateSummaryText() {
    if (!currentType) {
      summaryEl.textContent = NO_TYPE_MESSAGE;
      summaryEl.classList.add("no-selected");
      return;
    }

    const count = selectionCountByType.get(currentType) ?? 0;
    if (!count) {
      summaryEl.textContent = "";
      summaryEl.classList.add("no-selected");
    } else {
      summaryEl.textContent =
        count === 1 ? "1 opgave valgt" : `${count} opgaver valgt`;
      summaryEl.classList.remove("no-selected");
    }
  }

  function updateModalCount() {
    const count = currentSelection.size;
    if (!count) {
      countEl.textContent = "Ingen rækker valgt";
      countEl.classList.add("no-selected");
    } else {
      countEl.textContent =
        count === 1 ? "1 række valgt" : `${count} rækker valgt`;
      countEl.classList.remove("no-selected");
    }
  }

  function updateCheckAllState() {
    const total = currentTasks.length;
    const selected = currentSelection.size;

    if (!total) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }

    checkAll.checked = selected === total;
    checkAll.indeterminate = selected > 0 && selected < total;
  }

  function renderRows() {
    tableBody.innerHTML = "";

    if (!currentTasks.length) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = "Ingen opgaver tilgængelige";
      emptyRow.appendChild(cell);
      tableBody.appendChild(emptyRow);
      checkAll.checked = false;
      checkAll.indeterminate = false;
      updateModalCount();
      return;
    }

    const checkboxIds: string[] = [];

    currentTasks.forEach((task, index) => {
      const row = document.createElement("tr");

      const selectCell = document.createElement("td");
      const selectGroup = document.createElement("div");
      selectGroup.className = "form-group-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-checkbox";
      const checkboxId = `choose-tasks-row-${task.ID}`;
      checkbox.id = checkboxId;
      checkbox.name = "choose-tasks-row[]";
      checkbox.value = String(task.ID);
      checkbox.checked = currentSelection.has(task.ID);
      checkbox.dataset.index = String(index);
      selectGroup.appendChild(checkbox);

      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.innerHTML = '<span class="sr-only">Vælg række</span>';
      selectGroup.appendChild(label);

      selectCell.appendChild(selectGroup);
      row.appendChild(selectCell);

      const titleCell = document.createElement("td");
      titleCell.textContent = task.Title;
      row.appendChild(titleCell);

      const descCell = document.createElement("td");
      descCell.textContent = task.Description || "-";
      row.appendChild(descCell);

      const difficultyCell = document.createElement("td");
      difficultyCell.textContent = task.Difficulty || "-";
      row.appendChild(difficultyCell);

      const locationCell = document.createElement("td");
      locationCell.textContent = `${task.Latitude.toFixed(
        3
      )}, ${task.Longitude.toFixed(3)}`;
      row.appendChild(locationCell);

      tableBody.appendChild(row);

      checkboxIds.push(checkboxId);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          currentSelection.add(task.ID);
        } else {
          currentSelection.delete(task.ID);
        }
        updateModalCount();
        updateCheckAllState();
      });
    });

    checkAll.setAttribute("aria-controls", checkboxIds.join(" "));
    updateModalCount();
    updateCheckAllState();
  }

  async function loadAndRenderTasks() {
    if (!currentType) {
      return;
    }
    currentTasks = await options.requestTasks(currentType);
    currentTasks.sort((a, b) => a.Title.localeCompare(b.Title));
    renderRows();
  }

  openBtn.addEventListener("click", () => {
    if (!currentType) {
      return;
    }

    typeLabel.textContent = `Scenarietype: ${currentType}`;
    loadAndRenderTasks()
      .then(() => {
        updateModalCount();
        updateCheckAllState();
        openModal();
      })
      .catch(() => {
        // Leave modal closed on failure and keep selection untouched
      });
  });

  checkAll.addEventListener("change", () => {
    if (!currentTasks.length) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }

    if (checkAll.checked) {
      currentSelection = new Set(currentTasks.map((task) => task.ID));
    } else {
      currentSelection.clear();
    }

    tableBody
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = checkAll.checked;
      });

    updateModalCount();
    updateCheckAllState();
  });

  applyBtn.addEventListener("click", () => {
    if (!currentType) {
      closeModal();
      return;
    }

    const selectionCopy = new Set(currentSelection);
    selectionCountByType.set(currentType, selectionCopy.size);
    updateSummaryText();
    options.onApplySelection(currentType, selectionCopy);
    closeModal();
  });

  cancelBtn.addEventListener("click", () => {
    closeModal();
  });

  if (!isDialogSupported) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  return {
    setScenarioType(type, selected) {
      currentType = type;

      if (!type) {
        currentSelection.clear();
        openBtn.disabled = true;
        selectionCountByType.clear();
        updateSummaryText();
        closeModal();
        return;
      }

      openBtn.disabled = false;
      currentSelection = new Set(selected);
      selectionCountByType.set(type, currentSelection.size);
      updateSummaryText();

      if (isModalOpen()) {
        loadAndRenderTasks().catch(() => void 0);
      }
    },
    async refresh(type, selected) {
      selectionCountByType.set(type, selected.size);

      if (currentType !== type) {
        updateSummaryText();
        return;
      }

      currentSelection = new Set(selected);
      updateSummaryText();

      if (isModalOpen()) {
        await loadAndRenderTasks();
      } else {
        updateModalCount();
        updateCheckAllState();
      }
    },
  };
}
