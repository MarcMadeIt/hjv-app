import deleteScenario from "./helpers/deleteScenario";
import fetchAllScenarios from "./helpers/fetchAllScenarios";
import "./listScenario.css";

type Env = "land" | "sea";
export type ScenarioFilter = "all" | Env;

type Scenario = {
  scenarioId: string;
  title?: string;
  description?: string;
  type: Env;
  createdAt?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function labelFromEnv(env: Env) {
  return env === "land"
    ? { text: "Land", className: "badge-success" }
    : { text: "Sø", className: "badge-info" };
}

function matches(s: Scenario, query: string, filter: ScenarioFilter) {
  if (filter !== "all" && s.type !== filter) return false;

  const q = query.trim().toLowerCase();
  if (!q) return true;

  const hay = `${s.title ?? ""} ${s.description ?? ""}`.toLowerCase();
  return hay.includes(q);
}

type ListState = { query: string; filter: ScenarioFilter };
const LIST_STATE = Symbol("listScenarioState");
const LIST_BOUND = Symbol("listScenarioBound");

export async function renderListScenario(
  host: HTMLDivElement,
  opts?: Partial<ListState>
): Promise<void> {
  const prev: ListState = (host as any)[LIST_STATE] ?? {
    query: "",
    filter: "all",
  };
  const state: ListState = {
    query: opts?.query ?? prev.query,
    filter: opts?.filter ?? prev.filter,
  };
  (host as any)[LIST_STATE] = state;

  if (!(host as any)[LIST_BOUND]) {
    (host as any)[LIST_BOUND] = true;

    host.addEventListener("click", async (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button[data-action]"
      );
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (!action || !id) return;

      if (action === "view") {
        console.log("View scenario:", id);
        return;
      }

      if (action === "edit") {
        console.log("Edit scenario:", id);
        return;
      }

      if (action === "delete") {
        const ok = window.confirm(
          "Er du sikker på, at du vil slette scenariet?"
        );
        if (!ok) return;

        try {
          btn.disabled = true;
          await deleteScenario(id);

          const st: ListState = (host as any)[LIST_STATE] ?? {
            query: "",
            filter: "all",
          };
          await renderListScenario(host, st);
        } catch (err) {
          console.error(err);
          alert("Kunne ikke slette scenariet.");
          btn.disabled = false;
        }
      }
    });
  }

  host.innerHTML = `
    <div class="table--responsive-scroll" tabindex="3">
      <table class="table structured-list">
        <tbody>
          <tr><td>Indlæser…</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = host.querySelector("tbody");
  if (!tbody) return;

  try {
    const scenarios = (await fetchAllScenarios()) as Scenario[];

    const visible = scenarios.filter((s) =>
      matches(s, state.query, state.filter)
    );

    if (!visible.length) {
      tbody.innerHTML = `<tr><td>Ingen scenarier matcher din søgning.</td></tr>`;
      return;
    }

    tbody.innerHTML = visible
      .map((s) => {
        const badge = labelFromEnv(s.type);
        const title = escapeHtml(s.title ?? "Uden titel");
        const scenarioId = escapeHtml(s.scenarioId);

        return `
          <tr data-scenario-id="${scenarioId}">
            <th scope="row">
              <span>${title}</span>
              <strong class="badge ${badge.className}">${badge.text}</strong>
            </th>
            <td class="d-print-none align-text-md-right">
              <button type="button" data-action="view" data-id="${scenarioId}">Vis</button>
            </td>
            <td class="d-print-none align-text-md-right">
              <button type="button" data-action="edit" data-id="${scenarioId}">Redigér</button>
            </td>
            <td class="d-print-none align-text-md-right">
              <button type="button" data-action="delete" data-id="${scenarioId}">Slet</button>
            </td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td>Kunne ikke hente scenarier.</td></tr>`;
    console.error(err);
  }
}
