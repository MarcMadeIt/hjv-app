import "./listScenario.css";

export function renderListScenario(host: HTMLDivElement): void {
  host.innerHTML = `
        <div class="table--responsive-scroll" tabindex="3">
            <table class="table structured-list ">
                <tbody>
                    <tr>
                        <th scope="row"> <span>Scenarie 1</span> <strong class="badge badge-success">Land</strong> </th>
                        <td class="d-print-none align-text-md-right">
                            <button href="#">Vis</button></td>
                        <td class="d-print-none align-text-md-right">
                            <button href="#">Redigér</button></td>
                    </tr>
                    <tr>
                       <th scope="row"><span>Scenarie 2</span> <strong class="badge badge-info">Sø</strong> </th>
                        <td class="d-print-none align-text-md-right">
                            <button href="#">Vis</button></td>
                        <td class=" align-text-md-right">
                            <button href="#">Redigér</button></td>
                    </tr>
                     <tr>
                       <th scope="row"><span>Scenarie 3</span> <strong class="badge badge-success">Land</strong> </th>
                        <td class="d-print-none align-text-md-right">
                            <button href="#">Vis</button></td>
                        <td class=" align-text-md-right">
                            <button href="#">Redigér</button></td>
                    </tr>
                     <tr>
                       <th scope="row"><span>Scenarie 4</span> <strong class="badge badge-info">Sø</strong> </th>
                        <td class="d-print-none align-text-md-right">
                            <button href="#">Vis</button></td>
                        <td class=" align-text-md-right">
                            <button href="#">Redigér</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
`;
}
