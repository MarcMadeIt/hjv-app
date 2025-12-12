import "./style.css";
import { renderContent } from "./components/content/content";
import { renderHeader } from "./components/header/header";
import { renderMap } from "./components/map/map";
import { renderNavTab } from "./components/navTab/navTab";
import "../node_modules/dkfds/dist/css/dkfds.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (appRoot) {
  appRoot.innerHTML = `
  <main>
    <header id="header"></header>
    <div id="container">
      <div id="content"></div>
      <div id="map-frame"></div>
    </div>
    <div id="createScenario"></div>
    <div id="nav-tab"></div>
  </main>
`;

  const header = appRoot.querySelector<HTMLDivElement>("#header");
  const content = appRoot.querySelector<HTMLDivElement>("#content");
  const map = appRoot.querySelector<HTMLDivElement>("#map-frame");
  const navTab = appRoot.querySelector<HTMLDivElement>("#nav-tab");

  if (header) {
    renderHeader(header);
  }
  if (content) {
    renderContent(content);
  }
  if (map) {
    renderMap(map);
  }
  if (navTab) {
    renderNavTab(navTab, { contentHost: content, mapHost: map });
  }
}
