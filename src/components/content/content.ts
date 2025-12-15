import { renderCreateScenario } from "./createScenario/createScenario";
import {
  renderActionScenario,
  type ScenarioFilter,
} from "./actionScenario/actionScenario";
import { renderScenarioEditor } from "./listScenario/editScenarioView";
import { renderListScenario } from "./listScenario/listScenario";
import type { RemoteScenario } from "../../types/types";

export function renderContent(host: HTMLDivElement): void {
  host.innerHTML = `
    <div id="content-initial" class="content content-view">
      <button class="button button-primary xs-full-width" id="create-scenario-btn">
        Opret scenarie
      </button>
      <div id="actionScenario"></div>
      <div id="listScenario"></div>
    </div>

    <div id="scenario-view" class="content-view" style="display:none;"></div>
  `;

  const button = host.querySelector<HTMLButtonElement>("#create-scenario-btn");
  const initialView = host.querySelector<HTMLDivElement>("#content-initial");
  const scenarioView = host.querySelector<HTMLDivElement>("#scenario-view");
  const actionScenario = host.querySelector<HTMLDivElement>("#actionScenario");
  const listScenario = host.querySelector<HTMLDivElement>("#listScenario");

  if (
    !button ||
    !initialView ||
    !scenarioView ||
    !actionScenario ||
    !listScenario
  )
    return;

  const state = {
    query: "",
    filter: "all" as ScenarioFilter,
  };

  const listScenarioEl = listScenario as HTMLDivElement;
  const scenarioViewEl = scenarioView as HTMLDivElement;
  const initialViewEl = initialView as HTMLDivElement;

  function openScenarioView(
    setup: (container: HTMLDivElement, close: () => void) => void,
    onExit?: () => void,
    options?: {
      header?: (close: () => void) =>
        | string
        | {
            html: string;
            bind?: (root: HTMLElement, close: () => void) => void;
          };
    }
  ) {
    initialViewEl.style.display = "none";
    scenarioViewEl.style.display = "";

    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      scenarioViewEl.style.display = "none";
      initialViewEl.style.display = "";
      scenarioViewEl.innerHTML = "";
      onExit?.();
    };

    const headerContent = options?.header?.(close);
    const headerHtml =
      typeof headerContent === "string" ? headerContent : headerContent?.html;

    scenarioViewEl.innerHTML = `
      <div id="scenario-header">
        ${
          headerHtml ??
          `<button class="button button-tertiary xs-full-width" id="back-btn">
            <i class="icon icon-chevron-left"></i> Tilbage
          </button>`
        }
      </div>
      <div id="scenario-content"></div>
    `;

    const scenarioContent =
      scenarioViewEl.querySelector<HTMLDivElement>("#scenario-content");
    if (!scenarioContent) return;

    if (headerContent && typeof headerContent !== "string") {
      const headerEl =
        scenarioViewEl.querySelector<HTMLElement>("#scenario-header");
      headerContent.bind?.(headerEl ?? scenarioViewEl, close);
    } else {
      const backBtn =
        scenarioViewEl.querySelector<HTMLButtonElement>("#back-btn");
      backBtn?.addEventListener("click", close);
    }

    setup(scenarioContent, close);
  }

  function openScenarioEditor(scenario: RemoteScenario) {
    openScenarioView(
      (container, close) => {
        renderScenarioEditor(container, scenario, { onClose: close });
      },
      rerenderList,
      {
        header: (close) => ({
          html: `
            <button class="button button-tertiary xs-full-width" id="scenario-edit-close">
              Afslut redigering
            </button>
          `,
          bind: (root) => {
            const closeBtn = root.querySelector<HTMLButtonElement>(
              "#scenario-edit-close"
            );
            closeBtn?.addEventListener("click", close);
          },
        }),
      }
    );
  }

  function rerenderList() {
    renderListScenario(listScenarioEl, {
      query: state.query,
      filter: state.filter,
      onEdit: openScenarioEditor,
    });
  }

  renderActionScenario(actionScenario, {
    onSearch: (q) => {
      state.query = q;
      rerenderList();
    },
    onFilter: (f) => {
      state.filter = f;
      rerenderList();
    },
  });

  rerenderList();

  button.addEventListener("click", () => {
    openScenarioView((container, close) => {
      renderCreateScenario(container, () => {
        close();
      });
    }, rerenderList);
  });
}
