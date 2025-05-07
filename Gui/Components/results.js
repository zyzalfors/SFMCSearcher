import * as Controller from "/Logics/controller.js";
import * as Utility from "/Logics/utility.js";

export class Results extends HTMLElement {

  constructor() {
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
        border-radius: 6px;
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
        border-radius: 6px;
      }

      #results tr:nth-child(even) {
        background-color: var(--row-color);
      }
    </style>
    <div>
      <table id="results"></table>
    </div>`;
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

    const frag = document.createDocumentFragment();
    frag.appendChild(table.rows[0]);
    for(const row of rows) frag.appendChild(row);

    table.innerHTML = "";
    table.appendChild(frag);
    table._asc = !table._asc;
  }

  Populate(res) {
    if(!Array.isArray(res)) return;

    const table = this.node.getElementById("results");
    table.innerHTML = "";
    if(res.length === 0) return;

    const item = Controller.Controller.items.find(entry => entry.type === res[0].Type);
    if(!item) return;

    const fields = Object.keys(res[0]);
    const frag = document.createDocumentFragment();

    const row = document.createElement("tr");
    const cell = document.createElement("th");
    cell.innerHTML = res[0].Type;
    cell.addEventListener("click", ev => this.Sort(ev.target));
    row.appendChild(cell);

    for(const field of item.tableFields) {
      if(!fields.includes(field)) continue;

      const cell = document.createElement("th");
      cell.innerHTML = field;
      cell.addEventListener("click", ev => this.Sort(ev.target));
      row.appendChild(cell);
    }
    frag.appendChild(row);

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
      frag.appendChild(row);

      n++;
    }

    table.appendChild(frag);
    table._asc = false;
  }

  Export() {
    const table = this.node.getElementById("results");
    if(table.rows.length === 0) return;

    const sv = [];
    for(const tableRow of table.rows) {
      const row = [];
      for(const tableCell of tableRow.cells) row.push(tableCell.innerText);
      sv.push(row);
    }

    const sep = "|";
    const data = sv.map(row => row.join(sep)).join("\n");
    const itemsName = table.rows[0].cells[0].innerText;
    Utility.Utility.Output("sv", data, true, null, itemsName);
  }

}

customElements.define("app-results", Results);