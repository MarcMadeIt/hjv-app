import "./navTab.css";

export type NavTabView = "list" | "map";

interface RenderNavTabOptions {
  contentHost: HTMLDivElement | null;
  mapHost: HTMLDivElement | null;
  defaultView?: NavTabView;
}

export function renderNavTab(
  host: HTMLDivElement,
  { contentHost, mapHost, defaultView = "list" }: RenderNavTabOptions
): void {
  if (!contentHost || !mapHost) {
    host.innerHTML = "";
    return;
  }

  host.innerHTML = `
    <nav id="nav-tab" aria-label="Visning" role="tablist">
      <button
        id="nav-btn"
        data-view="list"
        role="tab"
        aria-selected="false"
           aria-label="Liste af scenarier"
      >
        <i class="icon icon-format-list-bulleted" aria-hidden="true" id="nav-icon"></i>
      </button>
      <button
        id="nav-btn"
        data-view="map"
        role="tab"
        aria-selected="false"
        aria-label="Kort"
      >
        <i class="icon icon-map" aria-hidden="true"></i>
      </button>
    </nav>
  `;

  const buttons = Array.from(
    host.querySelectorAll<HTMLButtonElement>("#nav-btn")
  );

  const setActiveView = (view: NavTabView) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (view === "list") {
      mapHost.classList.add("is-hidden-mobile");
      contentHost.classList.remove("is-hidden-mobile");
    } else {
      contentHost.classList.add("is-hidden-mobile");
      mapHost.classList.remove("is-hidden-mobile");
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view as NavTabView | undefined;
      if (view) {
        setActiveView(view);
      }
    });
  });

  setActiveView(defaultView);
}
