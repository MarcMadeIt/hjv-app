import "./style.css";
import { renderContent } from "./components/content";
import { renderCreateScenario } from "./components/createScenario";
import { renderHeader } from "./components/header";
import { renderMap } from "./components/map";
import "../node_modules/dkfds/dist/css/dkfds.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (appRoot) {
  appRoot.innerHTML = `
  <div>
    <header id="header"></header>
    <div id="container">
      <div id="content"></div>
      <div id="map-frame"></div>
    </div>
  </div>
  <div id="createScenario"></div>
`;

  const header = appRoot.querySelector<HTMLDivElement>("#header");
  const content = appRoot.querySelector<HTMLDivElement>("#content");
  const map = appRoot.querySelector<HTMLDivElement>("#map-frame");
  const createScenario =
    appRoot.querySelector<HTMLDivElement>("#createScenario");

  if (header) {
    renderHeader(header);
  }
  if (content) {
    renderContent(content);
  }
  if (map) {
    renderMap(map);
  }
  if (createScenario) {
    renderCreateScenario(createScenario);
  }
}
