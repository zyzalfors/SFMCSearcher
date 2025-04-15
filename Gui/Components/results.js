export class Results extends HTMLElement {

  constructor(controller) {
    super();

    this.node = this.attachShadow({mode: "closed"});
    this.node.innerHTML = `
    <style>
      * {
        font-family: var(--font-family);
      }

      #results th {
        background-color: var(--sf-dark-blue);
        color: var(--text-color);
        margin: 0;
        border: 0;
        padding: 12px;
        text-align: left;
        position: sticky;
        top: 0;
      }

      #results th:hover {
        cursor: pointer;
        background-color: var(--sf-darker-blue);
        transition: 0.3s;
      }

      #results td {
        margin: 0;
        border: 0;
        padding: 12px;
        text-align: left;
      }

      #results tr:nth-child(even) {
        background-color: var(--row-color);
      }
    </style>
    <div>
      <table id="results"></table>
    </div>`;

    this.controller = controller;
  }

  Sort(th) {
    const index = th.cellIndex;
    const table = this.node.getElementById("results");
    const rows = Array.from(table.rows).slice(1);

    rows.sort((row1, row2) => {
      const val1 = row1.cells[index].textContent;
      const val2 = row2.cells[index].textContent;
      if(!isNaN(val1) && !isNaN(val2)) return table._asc ? val1 - val2 : val2 - val1;
      return table._asc ? val1.localeCompare(val2) : val2.localeCompare(val1);
    });

    while(table.rows.length > 1) table.deleteRow(1);
    for(const row of rows) table.appendChild(row);

    table._asc = !table._asc;
  }

  Populate(res) {
    const table = this.node.getElementById("results");
    table._asc = true;
    while(table.rows.length > 0) table.deleteRow(0);

    if(res.length === 0) return;

    const item = this.controller.items.find(entry => entry.type === res[0].Type);
    if(!item) return;

    const row = document.createElement("tr");
    const cell = document.createElement("th");
    cell.innerHTML = res[0].Type;
    cell.addEventListener("click", ev => this.Sort(ev.target));
    row.appendChild(cell);

    const fields = Object.keys(res[0]);

    for(const field of item.tableFields) {
      if(!fields.includes(field)) continue;

      const cell = document.createElement("th");
      cell.innerHTML = field;
      cell.addEventListener("click", ev => this.Sort(ev.target));
      row.appendChild(cell);
    }
    table.appendChild(row);

    let n = 1;
    for(const result of res) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.innerHTML = n;
      row.appendChild(cell);

      for(const field of item.tableFields) {
        if(!fields.includes(field)) continue;

        const cell = document.createElement("td");
        cell.innerHTML = result[field];
        row.appendChild(cell);
      }
      table.appendChild(row);

      n++;
    }
  }

}

customElements.define("app-results", Results);