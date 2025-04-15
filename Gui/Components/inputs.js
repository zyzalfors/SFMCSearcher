export class Inputs extends HTMLElement {

  constructor(results, utility, controller) {
    super();

    this.node = this.attachShadow({mode: "closed"});
    this.node.innerHTML = `
    <style>
      * {
        font-family: var(--font-family);
      }

      .entry {
        display: flex;
        margin: 0;
        border: 0;
        padding: 6px;
      }

      .check {
        padding-left: 0;
        padding-right: 6px;
        padding-top: 0;
        padding-bottom: 0;
      }

      .label {
        margin: 0;
        border: 0;
        padding: 0;
      }

      select {
        margin: 0;
        border: 1px solid var(--border-color);
        padding: 6px;
        width: 100%;
        height: 100%;
        border-radius: 6px;
      }

      input[type="checkbox"] {
        margin: 0;
        border: 1px solid var(--border-color);
        padding: 0;
        width: 16px;
        height: 16px;
        appearance: none;
        border-radius: 6px;
      }

      input[type="checkbox"]:checked::after {
        content: "";
        display: block;
        width: 5px;
        height: 10px;
        border: solid var(--checked-color);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        position: relative;
        left: 4px;
      }

      input[type="file"] {
        display: none;
      }

      textarea {
        margin: 0;
        border: 1px solid var(--border-color);
        padding: 6px;
        width: 100%;
        height: 100%;
        border-radius: 6px;
      }

      select:focus, input:focus, textarea:focus {
        outline: none;
      }

      select:hover, input:hover, textarea:hover {
        cursor: pointer;
      }

      button {
        background-color: var(--sf-dark-blue);
        color: var(--text-color);
        margin: 0;
        border: 0;
        padding: 2px 55px;
        width: 100%;
        height: 100%;
        border-radius: 6px;
      }

      button:hover{
        cursor: pointer;
        background-color: var(--sf-darker-blue);
        transition: 0.3s;
      }

      button:active {
        transform: translateY(2px);
      }
    </style>
    <div>
      <div class="entry search export">
        <select id="stored-bus"></select>
      </div>
      <div class="entry search export">
        <select id="stored-items"></select>
      </div>
      <div class="entry search">
        <select id="fields"></select>
      </div>
      <div class="entry search">
        <textarea id="pattern" placeholder="Type pattern ..."></textarea>
      </div>
      <div class="entry search" style="display:none">
        <textarea id="query" placeholder="Type query ..."></textarea>
      </div>
      <div class="entry search">
        <div class="check"><input id="usequery" type="checkbox"></div>
        <div class="label"><label for="usequery">Query</label></div>
      </div>
      <div class="entry search">
        <div class="check"><input id="isregex" type="checkbox"></div>
        <div class="label"><label for="isregex">Regular expression</label></div>
      </div>
      <div class="entry search">
        <div class="check"><input id="caseins" type="checkbox" checked></div>
        <div class="label"><label for="caseins">Case insensitive</label></div>
      </div>
      <div class="entry search">
        <button id="search">Search</button>
      </div>
      <div class="entry load" style="display:none">
        <select id="load-items"></select>
      </div>
      <div class="entry load" style="display:none">
        <button id="load">Load</button>
      </div>
      <div class="entry load" style="display:none">
        <button id="import">Import</button><input type="file" id="imp"/>
      </div>
      <div class="entry export" style="display:none">
        <button id="clear">Clear</button>
      </div>
      <div class="entry export" style="display:none">
        <button id="export">Export</button>
      </div>
      <div class="entry export" style="display:none">
        <button id="view">View</button>
      </div>
    </div>`;

    this.results = results;
    this.utility = utility;
    this.controller = controller;

    this.node.getElementById("stored-bus").addEventListener("change", async ev => {
      this.UpdateQuery(ev.target);
      await this.InitItems();
    });

    this.node.getElementById("stored-items").addEventListener("change", ev => {
      this.UpdateQuery(ev.target);
      this.InitFields();
    });

    this.node.getElementById("fields").addEventListener("change", ev => this.UpdateQuery(ev.target));
    this.node.getElementById("usequery").addEventListener("change", ev => this.InitQuery(ev.target));

    const items =  this.node.getElementById("load-items");
    for(const item of this.controller.items) {
      const option = document.createElement("option");
      option.text = item.itemsName;
      option.value = item.itemsName;
      items.appendChild(option);
    }

    for(const btn of this.node.querySelectorAll("button")) btn.addEventListener("click", async ev => await this.Process(ev.target));
    this.node.getElementById("imp").addEventListener("change", ev => this.ProcessImport(ev.target));
  }

  InitSearch() {
    for(const div of this.node.querySelectorAll(".load")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".search")) div.removeAttribute("style");
    this.InitQuery();
  }

  InitLoad() {
    for(const div of this.node.querySelectorAll(".search")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".load")) div.removeAttribute("style");
  }

  InitExport() {
    for(const div of this.node.querySelectorAll(".load")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".search")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.removeAttribute("style");
  }

  InitQuery() {
    const pattern = this.node.getElementById("pattern");
    const query = this.node.getElementById("query");
    const show = this.node.getElementById("usequery").checked;
    if(show) {
      pattern.parentElement.style.display = "none";
      query.parentElement.removeAttribute("style");
    }
    else {
      pattern.parentElement.removeAttribute("style");
      query.parentElement.style.display = "none";
    }
  }

  UpdateQuery(select) {
    if(!this.node.getElementById("usequery").checked) return;

    const queryArea = this.node.getElementById("query");
    const query = queryArea.value;
    const pos = queryArea.selectionStart;

    this.node.getElementById("query").value = `${query.substring(0, pos)}${select.value}${query.substring(pos)}`;
  }

  InitFields() {
    const fields = this.node.getElementById("fields");
    while(fields.options.length > 0) fields.remove(0);

    const itemsName = this.node.getElementById("stored-items").value;
    const item = this.controller.items.find(entry => entry.itemsName === itemsName);
    if(!item) return;

    for(const field of item.searchFields) {
      const option = document.createElement("option");
      option.value = field;
      option.text = field;
      fields.appendChild(option);
    }
  }

  async InitItems() {
    const items = this.node.getElementById("stored-items");
    while(items.options.length > 0) items.remove(0);

    const BUid = this.node.getElementById("stored-bus").value;
    const storage = await this.utility.GetStorage(BUid);

    let data = [];
    if(!Array.isArray(storage.data)) data = [];
    else if(!BUid) data = storage.data;
    else if(storage.i > -1) data = [storage.data[storage.i]];

    const fields = [...this.utility.storageFields];

    for(const entry of data) {
      for(const field in entry) {
        if(fields.includes(field)) continue;
        fields.push(field);

        const option = document.createElement("option");
        option.value = field;
        option.text = field;
        items.appendChild(option);
      }
    }

    this.InitFields();
  }

  async InitBUs() {
    const BUs = this.node.getElementById("stored-bus");
    while(BUs.options.length > 0) BUs.remove(0);

    const data = await this.utility.GetStoredBUData();
    if(data.length > 1) {
      const option = document.createElement("option");
      option.text = "--All--";
      option.value = "";
      BUs.appendChild(option);
    }

    for(const entry of data) {
      const option = document.createElement("option");
      option.text = `${entry.BUname} (${entry.BUid})`;
      option.value = entry.BUid;
      BUs.appendChild(option);
    }

    await this.InitItems();
  }

  ProcessImport(input) {
    const file = input.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", async () => {
      try {
        const action = this.controller.actions.find(entry => entry.name === "import");
        if(!action) return;

        await action.proc(JSON.parse(reader.result));
        await this.InitBUs();
      }
      catch(err) {
        window.alert(err);
      }
      finally {
        input.value = null;
      }
    });

    reader.addEventListener("error", () => {
      window.alert("Error reading the file");
    });

    reader.readAsText(file);
  }

  async Process(button) {
    const actionName = button.id;
    const text = button.innerText;
    button.innerText += "ing...";
    button.disabled = true;

    let inp;
    try {
      switch(actionName) {
        case "import":
          this.node.getElementById("imp").click();
          break;

        case "clear": case "export": case "search": case "view":
          inp = {
                  actionName: actionName,
                  BUid: this.node.getElementById("stored-bus").value,
                  itemsName: this.node.getElementById("stored-items").value,
                  field: this.node.getElementById("fields").value,
                  pattern: this.node.getElementById("pattern").value,
                  query: this.node.getElementById("query").value,
                  useQuery: this.node.getElementById("usequery").checked,
                  isRegex: this.node.getElementById("isregex").checked,
                  caseIns: this.node.getElementById("caseins").checked
                };
          break;

        case "load":
          inp = {actionName: actionName, itemsName: this.node.getElementById("load-items").value};
          break;
      }
      if(inp) {
        const res = await this.controller.Process(inp);
        if(res) this.results.Populate(res);
      }
    }
    catch(err) {
      console.log(err);
      window.alert(err);
    }
    finally {
      button.innerText = text;
      button.disabled = false;
      if(["load", "clear"].includes(actionName)) await this.InitBUs();
    }
  }

  ProcessKey(ev) {
    if(ev.ctrlKey && ev.code === "Enter") this.node.getElementById("search").click();
  }

}

customElements.define("app-inputs", Inputs);