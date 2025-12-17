import type { MissionTask } from "../../../../types/types";

type ScenarioType = MissionTask["type"];
let geocodeController: AbortController | null = null;

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
      <button
        type="button"
        class="button button-secondary"
        id="choose-tasks-open"
        disabled
        data-module="modal"
        data-target="choose-tasks-modal"
        aria-haspopup="dialog"
      >
        Vælg opgaver
      </button>
      <p class="table-selected-number no-selected" id="choose-tasks-summary">${NO_TYPE_MESSAGE}</p>
      <div
        class="fds-modal choose-tasks-modal"
        id="choose-tasks-modal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="choose-tasks-heading"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="choose-tasks-heading">Vælg opgaver</h2>
            <button class="modal-close function-link" id="choose-tasks-close">
              <svg class="icon-svg" focusable="false" aria-hidden="true"><use href="#close"></use></svg>
              Luk
            </button>
          </div>
          <div class="modal-body">
            <p id="choose-tasks-type"></p>
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
                    <th scope="col">Adresse</th>
                    <th scope="col">Koordinater</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <div class="button-group">
              <button type="button" class="button button-primary" id="choose-tasks-apply">
                Tilføj valgte
              </button>
              <button type="button" class="button button-secondary" id="choose-tasks-cancel">
                Annuller
              </button>
            </div>
             <p class="table-selected-number no-selected" id="choose-tasks-count">Ingen rækker valgt</p>
          </div>
        </div>
      </div>
		</div>
	`;

  type PlaceInfo = { label: string; raw?: any };

  const placeCache = new Map<string, PlaceInfo>();

  function cacheKey(lat: number, lon: number) {
    return `${lat.toFixed(4)},${lon.toFixed(4)}`;
  }

  function pickPlaceLabel(data: any): string {
    const a = data?.address ?? {};
    return (
      data?.name ||
      a.attraction ||
      a.building ||
      a.amenity ||
      a.tourism ||
      a.shop ||
      a.road ||
      a.neighbourhood ||
      a.suburb ||
      a.village ||
      a.town ||
      a.city ||
      a.municipality ||
      a.county ||
      a.state ||
      data?.display_name ||
      "Ukendt sted"
    );
  }

  async function reverseGeocode(
    lat: number,
    lon: number,
    signal?: AbortSignal
  ) {
    const key = cacheKey(lat, lon);
    const cached = placeCache.get(key);
    if (cached) return cached;

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const fallback = { label: "Ukendt sted" };
      placeCache.set(key, fallback);
      return fallback;
    }

    const data = await res.json();
    const label = pickPlaceLabel(data);

    const info = { label, raw: data };
    placeCache.set(key, info);
    return info;
  }

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
    host.querySelector<HTMLDivElement>("#choose-tasks-modal"),
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
  const closeBtn = requireElement(
    host.querySelector<HTMLButtonElement>("#choose-tasks-close"),
    "Choose tasks close button is missing"
  );
  const selectionCountByType = new Map<ScenarioType, number>();

  function isModalOpen(): boolean {
    return modal.getAttribute("aria-hidden") === "false";
  }

  function openModal() {
    if (!currentType || isModalOpen()) return;

    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-visible");
  }

  function closeModal() {
    if (!isModalOpen()) return;

    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-visible");
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
    geocodeController?.abort();
    geocodeController = new AbortController();
    const signal = geocodeController.signal;
    const sortedTasks = currentTasks?.slice().sort((a, b) => a.id - b.id);

    tableBody.innerHTML = "";

    if (!sortedTasks.length) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.colSpan = 6;
      cell.textContent = "Ingen opgaver tilgængelige";
      emptyRow.appendChild(cell);
      tableBody.appendChild(emptyRow);
      checkAll.checked = false;
      checkAll.indeterminate = false;
      updateModalCount();
      return;
    }

    const checkboxIds: string[] = [];

    sortedTasks.forEach((task, index) => {
      const row = document.createElement("tr");

      const selectCell = document.createElement("td");
      const selectGroup = document.createElement("div");
      selectGroup.className = "form-group-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-checkbox";
      const checkboxId = `choose-tasks-row-${task.id}`;
      checkbox.id = checkboxId;
      checkbox.name = "choose-tasks-row[]";
      checkbox.value = String(task.id);
      checkbox.checked = currentSelection.has(task.id);
      checkbox.dataset.index = String(index);
      selectGroup.appendChild(checkbox);

      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.innerHTML = '<span class="sr-only">Vælg række</span>';
      selectGroup.appendChild(label);

      selectCell.appendChild(selectGroup);
      row.appendChild(selectCell);

      const titleCell = document.createElement("td");
      titleCell.textContent = task.title;
      row.appendChild(titleCell);

      const descCell = document.createElement("td");
      descCell.textContent = task.description || "-";
      row.appendChild(descCell);

      const difficultyCell = document.createElement("td");
      difficultyCell.textContent = task.difficulty || "-";
      row.appendChild(difficultyCell);

      const placeCell = document.createElement("td");
      placeCell.textContent = "Slår op…";
      row.appendChild(placeCell);

      const locationCell = document.createElement("td");
      locationCell.textContent = `${task.latitude.toFixed(
        3
      )}, ${task.longitude.toFixed(3)}`;
      row.appendChild(locationCell);

      tableBody.appendChild(row);
      reverseGeocode(task.latitude, task.longitude, signal)
        .then((info) => {
          // If row still exists (modal re-render can happen), update it
          if (placeCell.isConnected) placeCell.textContent = info.label;
        })
        .catch(() => {
          if (placeCell.isConnected) placeCell.textContent = "Ukendt sted";
        });

      checkboxIds.push(checkboxId);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          currentSelection.add(task.id);
        } else {
          currentSelection.delete(task.id);
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
    currentTasks.sort((a, b) => a.title.localeCompare(b.title));
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
      .catch(() => {});
  });

  checkAll.addEventListener("change", () => {
    if (!currentTasks.length) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }

    if (checkAll.checked) {
      currentSelection = new Set(currentTasks.map((task) => task.id));
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

  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

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
