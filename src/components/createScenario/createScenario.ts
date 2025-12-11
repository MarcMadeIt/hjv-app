import "./createScenario.css";

export function renderCreateScenario(host: HTMLDivElement): void {
  host.innerHTML = `
<form id="form" action="">  
   <!-- Opgaver - rolldown -->
    <div class="form-group">
    <label class="form-label" for="options">Vælg mellem opgaver</label>

    <select class="form-select" name="options" id="options" required>
        <option value="">Opgaver</option>
        <option value="option1">Hovedstaden</option>
        <option value="option2">Midtjylland</option>
        <option value="option3">Nordjylland</option>
        <option value="option4">Sjælland</option>
        <option value="option5">Syddanmark</option>
    </select>
  </div> 

     <!-- Name - input -->
  <div class="form-group">
    <label class="form-label" for="input-text">Navn</label>
    <input type="text" id="input-text" name="input-text" class="form-input" required>
  </div>

    <!-- Types - radiobutton -->
  <div class="form-group">
    <fieldset aria-labelledby="radio-example-legend">

        <legend class="form-label" id="radio-example-legend">Vælg type</legend>

        <div id="radio-options">
            <div class="form-group-radio">
                <input type="radio" id="radiogroup-option1" name="radio-example"
                    class="form-radio" value="v1">
                <label class="form-label" for="radiogroup-option1">Land</label>
            </div>

            <div class="form-group-radio">
                <input type="radio" id="radiogroup-option2" name="radio-example"
                    class="form-radio" value="v2">
                <label class="form-label" for="radiogroup-option2">Sø</label>
            </div>
        </div>

    </fieldset>
  </div>
  
  <!-- Status - buttons -->

      <div>
          <button class="button button-tertiary">
              Vælg lokation fra kortet
          </button>
      </div>
    <div id="mb-opdateret-nulstil">
      <div class="mb-7">
        <button class="button button-primary">
            Lokation Opdateret
        </button>
      </div>
      <div class="mb-7">
          <button class="button button-secondary">
              Nulstil
          </button>
      </div>
    </div>

  <!-- Description - tekstområde -->
    <div class="form-group">
        <label class="form-label" for="input-textarea">Tekstområde med label</label>

        <textarea class="form-input" id="input-textarea" name="input-textarea" rows="5" required></textarea>

    </div>
</form>

`;
}
