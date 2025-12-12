import { renderCreateScenario } from "../createScenario/createScenario";
import { renderActionScenario } from "./actionScenario/actionScenario";
import { renderListScenario } from "./listScenario/listScenario";

export function renderContent(host: HTMLDivElement): void {
  host.innerHTML = `
    <div id="content-initial">
      <button class="button button-secondary xs-full-width" id="create-scenario-btn">
        Opret scenario
      </button>
      <div id="actionScenario"> </div>
      <div id="listScenario"> </div>
    </div>

    <div id="scenario-view" style="display:none;">
    </div>
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

  renderListScenario(listScenario);
  renderActionScenario(actionScenario);

  button.addEventListener("click", () => {
    initialView.style.display = "none";
    scenarioView.style.display = "block";

    scenarioView.innerHTML = `
      <button class="button button-tertiary xs-full-width" id="back-btn">
        Tilbage
      </button>
      <div id="scenario-content"></div>
    `;

    const scenarioContent =
      scenarioView.querySelector<HTMLDivElement>("#scenario-content");
    if (scenarioContent) {
      renderCreateScenario(scenarioContent);
    }

    const backBtn = scenarioView.querySelector<HTMLButtonElement>("#back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        scenarioView.style.display = "none";
        initialView.style.display = "block";
        scenarioView.innerHTML = "";
      });
    }
  });
}
