function ensureConfirmModal(host: HTMLElement) {
  const existing = host.querySelector<HTMLDivElement>("#scenario-delete-modal");
  if (existing) return existing;

  const modal = document.createElement("div");
  modal.className = "fds-modal";
  modal.id = "scenario-delete-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "scenario-delete-modal-heading");
  modal.setAttribute("data-modal-forced-action", "");

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title" id="scenario-delete-modal-heading">Slet scenarie?</h2>
      </div>
      <div class="modal-body">
        <p id="scenario-delete-modal-text">Er du sikker på, at du vil slette scenariet?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="button button-primary" data-confirm="yes">
          Ja, slet
        </button>
        <button type="button" class="button button-secondary" data-confirm="no">
          Fortryd
        </button>
      </div>
    </div>
  `;

  host.appendChild(modal);
  return modal;
}

// Opens the modal and resolves true/false
export default function confirmWithModal(
  host: HTMLElement,
  message: string
): Promise<boolean> {
  const modal = ensureConfirmModal(host);
  const text = modal.querySelector<HTMLElement>("#scenario-delete-modal-text");
  if (text) text.textContent = message;

  return new Promise<boolean>((resolve) => {
    const yesBtn = modal.querySelector<HTMLButtonElement>(
      'button[data-confirm="yes"]'
    );
    const noBtn = modal.querySelector<HTMLButtonElement>(
      'button[data-confirm="no"]'
    );

    const cleanup = (result: boolean) => {
      yesBtn?.removeEventListener("click", onYes);
      noBtn?.removeEventListener("click", onNo);
      close();
      resolve(result);
    };

    const open = () => {
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open"); // optional; depends on your FDS setup
      yesBtn?.focus();
    };

    const close = () => {
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open"); // optional
    };

    const onYes = () => cleanup(true);
    const onNo = () => cleanup(false);

    yesBtn?.addEventListener("click", onYes);
    noBtn?.addEventListener("click", onNo);

    open();
  });
}
