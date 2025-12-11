import "./style.css";
import { renderTaskList } from "./components/taskList";
import "../node_modules/dkfds/dist/css/dkfds.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (appRoot) {
  appRoot.innerHTML = `
  <div>
    <header id="header"></div>
    <div id="listTasks"></div>
  </div>
`;

  const header = appRoot.querySelector<HTMLDivElement>("#header");
  const listHost = appRoot.querySelector<HTMLDivElement>("#listTasks");

  if (header) {
    renderTaskList(header);
  }
    if (listHost) {
    renderTaskList(listHost);
  }
}
