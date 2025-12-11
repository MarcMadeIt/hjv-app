import "./style.css";
import { renderTaskList } from "./components/taskList";
import { renderHeader } from "./components/header";
import { renderMap } from "./components/map";
import "../node_modules/dkfds/dist/css/dkfds.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (appRoot) {
  appRoot.innerHTML = `
  <div>
    <header id="header"></header>
    <div id="container">
    <div id="listTasks"></div>
    <div id="map"></div>
    </div>
  </div>
`;

  const header = appRoot.querySelector<HTMLDivElement>("#header");
  const listHost = appRoot.querySelector<HTMLDivElement>("#listTasks");
  const map = appRoot.querySelector<HTMLDivElement>("#map");

  if (header) {
    renderHeader(header);
  }
  if (listHost) {
    renderTaskList(listHost);
  }
  if (map) {
    renderMap(map);
  }
}
