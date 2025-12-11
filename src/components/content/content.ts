import { renderActionScenario } from "./actionScenario/actionScenario";
import { renderListScenario } from "./listScenario/listScenario";

export function renderContent(host: HTMLDivElement): void {
  host.innerHTML = `
  
  <div id="actionScenario"> </div>
  <div id="listScenario"> </div>
  
`;

  const actionScenario = host.querySelector<HTMLDivElement>("#actionScenario");
  const listScenario = host.querySelector<HTMLDivElement>("#listScenario");

  if (actionScenario) {
    renderActionScenario(actionScenario);
  }

  if (listScenario) {
    renderListScenario(listScenario);
  }
}
