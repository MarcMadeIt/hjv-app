import "./createScenario.css";

export function renderCreateScenario(host: HTMLDivElement): void {
  host.innerHTML = `
<form id="form" action="">  
   <!-- Opgaver - radiobutton -->
    <div class="form-group">
    <label class="form-label" for="options">Region</label>

    <select class="form-select" name="options" id="options" required>
        <option value="">Vælg region</option>
        <option value="option1">Hovedstaden</option>
        <option value="option2">Midtjylland</option>
        <option value="option3">Nordjylland</option>
        <option value="option4">Sjælland</option>
        <option value="option5">Syddanmark</option>
    </select>
  </div> 

     <!-- Name - input -->
  <div class="form-group">
    <label class="form-label" for="input-text">Inputfelt med label</label>
    <input type="text" id="input-text" name="input-text" class="form-input" required>
  </div>

    <!-- Types - radiobutton -->
  <div class="form-group">
    <fieldset aria-labelledby="radio-example-legend">

        <legend class="form-label" id="radio-example-legend">Radioknapper</legend>

        <div class="form-group-radio">
            <input type="radio" id="radiogroup-option1" name="radio-example"
                class="form-radio" value="v1">
            <label class="form-label" for="radiogroup-option1">Valg 1</label>

        </div>

        <div class="form-group-radio">
            <input type="radio" id="radiogroup-option2" name="radio-example"
                class="form-radio" value="v2">
            <label class="form-label" for="radiogroup-option2">Valg 2</label>

        </div>
    </fieldset>
  </div>
  
  <!-- Status - buttons -->
    <div class="mb-7">
        <button class="button button-primary">
            Primærknap
        </button>
    </div>
    <div class="mb-7">
        <button class="button button-secondary">
            Sekundærknap
        </button>
    </div>
    <div>
        <button class="button button-tertiary">
            Tertiærknap
        </button>
    </div>

  <!-- Description - tekstområde -->
    <div class="form-group">
        <label class="form-label" for="input-textarea">Tekstområde med label</label>

        <textarea class="form-input" id="input-textarea" name="input-textarea" rows="5" required></textarea>

    </div>
</form>

`;
}
