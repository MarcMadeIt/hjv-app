import "./actionScenario.css";

export type ScenarioFilter = "all" | "land" | "sea";

export function renderActionScenario(
  host: HTMLDivElement,
  opts: {
    onSearch: (q: string) => void;
    onFilter: (f: ScenarioFilter) => void;
  }
): void {
  host.innerHTML = `
    <div id="actions">
      <div class="form-group search">
        <label for="input-type-text-icon" class="sr-only">Søg efter indhold</label>
        <input class="form-input input-char-27" id="input-type-text-icon" name="search-icon" type="search">
        <button class="button button-search" type="button">
          <i class="icon icon-search"></i>
        </button>
      </div>

      <div class="form-group">
        <fieldset aria-labelledby="radio-example-legend" id="filters">
          <legend class="form-label" id="radio-example-legend">Filter område</legend>

          <div class="form-group-radio">
            <input type="radio" id="radiogroup-option1" name="radio-example" checked class="form-radio" value="all">
            <label class="form-label" for="radiogroup-option1">Alle</label>
          </div>

          <div class="form-group-radio">
            <input type="radio" id="radiogroup-option2" name="radio-example" class="form-radio" value="land">
            <label class="form-label" for="radiogroup-option2">Land</label>
          </div>

          <div class="form-group-radio">
            <input type="radio" id="radiogroup-option3" name="radio-example" class="form-radio" value="sea">
            <label class="form-label" for="radiogroup-option3">Sø</label>
          </div>
        </fieldset>
      </div>
    </div>
  `;

  const input = host.querySelector<HTMLInputElement>("#input-type-text-icon");
  const searchBtn = host.querySelector<HTMLButtonElement>(".button-search");
  const filters = host.querySelector<HTMLFieldSetElement>("#filters");

  if (!input || !searchBtn || !filters) return;

  // live search
  let t: number | undefined;
  input.addEventListener("input", () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => opts.onSearch(input.value), 150);
  });

  // search button
  searchBtn.addEventListener("click", () => opts.onSearch(input.value));

  // radio filter
  filters.addEventListener("change", () => {
    const checked = host.querySelector<HTMLInputElement>(
      'input[name="radio-example"]:checked'
    );
    const v = (checked?.value ?? "all") as ScenarioFilter;
    opts.onFilter(v);
  });
}
