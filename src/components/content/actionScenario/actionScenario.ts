import "./actionScenario.css";

export function renderActionScenario(host: HTMLDivElement): void {
  host.innerHTML = `

  <div id="actions">
    <button class="button button-secondary xs-full-width" aria-label="Opret scenarie">
        Opret scenarie
    </button>
    <div class="form-group search">
      <label for="input-type-text-icon" class="sr-only">Søg efter indhold</label>
      <input class="form-input input-char-27" id="input-type-text-icon" name="search-icon"
      type="search">
      <button class="button button-search">
      <i class="icon icon-search"></i>
      </button>
    </div>
    <div class="form-group">
      <fieldset aria-labelledby="radio-example-legend" id
      ="filters">

          <legend class="form-label" id="radio-example-legend">Filter område</legend>

          <div class="form-group-radio">
              <input type="radio" id="radiogroup-option1" name="radio-example" checked
                  class="form-radio" value="v1">
              <label class="form-label" for="radiogroup-option1">Alle</label>
          </div>

          <div class="form-group-radio">
              <input type="radio" id="radiogroup-option2" name="radio-example"
                  class="form-radio" value="v2">
              <label class="form-label" for="radiogroup-option2">Land</label>
          </div>

          <div class="form-group-radio">
              <input type="radio" id="radiogroup-option3" name="radio-example"
                  class="form-radio" value="v3">
              <label class="form-label" for="radiogroup-option3">Sø</label>
          </div>
      </fieldset>
    </div>
  </div>
`;
}
