import "./style.css";
import { renderTaskList } from "./components/taskList";
import "../node_modules/dkfds/dist/css/dkfds.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (appRoot) {
  appRoot.innerHTML = `
  <div>
    <div id="listTasks"></div>
  </div>
`;

  const listHost = appRoot.querySelector<HTMLDivElement>("#listTasks");

  if (listHost) {
    renderTaskList(listHost);
  }
}
