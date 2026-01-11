import "./style.css";
import { renderContent } from "./components/content/content";
import { renderHeader } from "./components/layout/header/header";
import { renderMap } from "./components/map/map";
import { renderNavTab } from "./components/layout/navTab/navTab";
import "../node_modules/dkfds/dist/css/dkfds.css";
import { renderFooter } from "./components/layout/footer/footer";

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
    <footer id="footer">
    </footer>
  </main>
`;

  const header = appRoot.querySelector<HTMLDivElement>("#header");
  const footer = appRoot.querySelector<HTMLDivElement>("#footer");
  const content = appRoot.querySelector<HTMLDivElement>("#content");
  const map = appRoot.querySelector<HTMLDivElement>("#map-frame");
  const navTab = appRoot.querySelector<HTMLDivElement>("#nav-tab");

  if (header) {
    renderHeader(header);
  }
  if (footer) {
    renderFooter(footer);
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
