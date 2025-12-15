import "./footer.css";

export function renderFooter(host: HTMLDivElement): void {
  host.innerHTML = ` 
            <div id="footer">
                    <div class="container">
                        <ul class="align-text-left unstyled-list inline-list">
                            <li class=""><strong class="weight-semibold">Hjemmeværnskommandoen</strong>
                            </li>
                            <li class=""><a href="mailto:hjk@hjv.dk" class="function-link"
                                    title="Skriv til Hjemmeværnskommandoen">hjk@hjv.dk</a>
                            </li>
                            <li class=""><a href="tel:+4512345678" class="function-link"
                                    title="Ring til os">+45 72 82 00 00</a></li>
                            <li class="d-print-none"><a href="#"
                                    class="function-link icon-link">Tilgængelighedserklæring<svg class="icon-svg" focusable="false" aria-hidden="true"><use href="#open-in-new"></use></svg></a>
                            </li>
                            <li class="d-print-none"><a href="#" class="function-link">Privatlivspolitik
                                    (cookies)</a></li>
                        </ul>
                    </div>
                </div>`;
}
