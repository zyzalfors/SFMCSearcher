import * as Controller from "/Logics/controller.js";
import * as DEImporter from "/Logics/deimporter.js";
import * as Utility from "/Logics/utility.js";

export class Inputs extends HTMLElement {

  constructor(results) {
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

      textarea, input[type="text"], input[type="number"] {
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
        <div class="check"><input id="use-query" type="checkbox"></div>
        <div class="label"><label for="use-query">Query</label></div>
      </div>
      <div class="entry search">
        <div class="check"><input id="is-regex" type="checkbox"></div>
        <div class="label"><label for="is-regex">Regular expression</label></div>
      </div>
      <div class="entry search">
        <div class="check"><input id="case-ins" type="checkbox" checked></div>
        <div class="label"><label for="case-ins">Case insensitive</label></div>
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
      <div class="entry export" style="display:none">
        <button id="export-res">Results export</button>
      </div>
      <div class="entry deimport" style="display:none">
        <input type="text" id="de-name" placeholder="Type DE name ...">
      </div>
      <div class="entry deimport" style="display:none">
        <textarea id="de-data" placeholder="Type separated values ..." wrap="off"></textarea>
      </div>
      <div class="entry deimport" style="display:none">
        <input type="text" id="sep" placeholder="Type separator ...">
      </div>
      <div class="entry deimport" style="display:none">
        <input type="number" id="chunk-size" placeholder="Type chunk size ..." min="1">
      </div>
      <div class="entry deimport" style="display:none">
        <select id="import-de-methods"></select>
      </div>
      <div class="entry deimport" style="display:none">
        <button id="import-de">Import</button>
      </div>
    </div>`;

    this.results = results;

    this.node.getElementById("stored-bus").addEventListener("change", async ev => {
      this.UpdateQuery(ev.target);
      await this.InitItems();
    });

    this.node.getElementById("stored-items").addEventListener("change", ev => {
      this.UpdateQuery(ev.target);
      this.InitFields();
    });

    this.node.getElementById("fields").addEventListener("change", ev => this.UpdateQuery(ev.target));
    this.node.getElementById("use-query").addEventListener("change", ev => this.InitQuery(ev.target));

    const frag = document.createDocumentFragment();

    const items = this.node.getElementById("load-items");
    for(const item of Controller.Controller.items) {
      const option = document.createElement("option");
      option.text = item.itemsName;
      option.value = item.itemsName;
      frag.appendChild(option);
    }
    items.appendChild(frag);
    frag.innerHTML = "";

    const methods = this.node.getElementById("import-de-methods");
    for(const method of DEImporter.DEImporter.methods) {
      const option = document.createElement("option");
      option.text = method;
      option.value = method;
      frag.appendChild(option);
    }
    methods.appendChild(frag);

    for(const btn of this.node.querySelectorAll("button")) btn.addEventListener("click", async ev => await this.Process(ev.target));
    this.node.getElementById("imp").addEventListener("change", ev => this.ProcessImport(ev.target));
  }

  InitSearch() {
    for(const div of this.node.querySelectorAll(".load")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".deimport")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".search")) div.removeAttribute("style");
    this.InitQuery();
  }

  InitLoad() {
    for(const div of this.node.querySelectorAll(".search")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".deimport")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".load")) div.removeAttribute("style");
  }

  InitExport() {
    for(const div of this.node.querySelectorAll(".load")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".search")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".deimport")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.removeAttribute("style");
  }

  InitDEImport() {
    for(const div of this.node.querySelectorAll(".load")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".search")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".export")) div.style.display = "none";
    for(const div of this.node.querySelectorAll(".deimport")) div.removeAttribute("style");
  }

  InitQuery() {
    const pattern = this.node.getElementById("pattern");
    const query = this.node.getElementById("query");
    const show = this.node.getElementById("use-query").checked;
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
    if(!this.node.getElementById("use-query").checked) return;

    const queryArea = this.node.getElementById("query");
    const query = queryArea.value;
    const pos = queryArea.selectionStart;

    this.node.getElementById("query").value = `${query.substring(0, pos)}${select.value}${query.substring(pos)}`;
  }

  InitFields() {
    const fields = this.node.getElementById("fields");
    fields.innerHTML = "";

    const itemsName = this.node.getElementById("stored-items").value;
    const item = Controller.Controller.items.find(entry => entry.itemsName === itemsName);
    if(!item) return;

    const frag = document.createDocumentFragment();
    for(const field of item.searchFields) {
      const option = document.createElement("option");
      option.value = field;
      option.text = field;
      frag.appendChild(option);
    }

    fields.appendChild(frag);
  }

  async InitItems() {
    const items = this.node.getElementById("stored-items");
    items.innerHTML = "";

    const BUid = this.node.getElementById("stored-bus").value;
    const storage = await Utility.Utility.GetStorage(BUid);

    let data = [];
    if(!Array.isArray(storage.data)) data = [];
    else if(!BUid) data = storage.data;
    else if(storage.i > -1) data = [storage.data[storage.i]];

    const fields = [...Utility.Utility.storageFields];
    const frag = document.createDocumentFragment();

    for(const entry of data) {
      for(const field in entry) {
        if(fields.includes(field)) continue;
        fields.push(field);

        const option = document.createElement("option");
        option.value = field;
        option.text = field;
        frag.appendChild(option);
      }
    }

    items.appendChild(frag);
    this.InitFields();
  }

  async InitBUs() {
    const BUs = this.node.getElementById("stored-bus");
    BUs.innerHTML = "";

    const data = await Utility.Utility.GetStoredBUData();
    const frag = document.createDocumentFragment();

    if(data.length > 1) {
      const option = document.createElement("option");
      option.text = "--All--";
      option.value = "";
      frag.appendChild(option);
    }

    for(const entry of data) {
      const option = document.createElement("option");
      option.text = `${entry.BUname} (${entry.BUid})`;
      option.value = entry.BUid;
      frag.appendChild(option);
    }

    BUs.appendChild(frag);
    await this.InitItems();
  }

  ProcessImport(input) {
    const file = input.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", async () => {
      try {
        const action = Controller.Controller.actions.find(entry => entry.name === "import");
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

    try {
      switch(actionName) {
        case "import-de":
          await Controller.Controller.Process({
            actionName: actionName,
            DEname: this.node.getElementById("de-name").value.trim(),
            data: this.node.getElementById("de-data").value,
            sep: this.node.getElementById("sep").value.trim(),
            chunkSize: this.node.getElementById("chunk-size").value.trim(),
            method: this.node.getElementById("import-de-methods").value
          });
          break;

        case "import":
          this.node.getElementById("imp").click();
          break;

        case "clear": case "export": case "search": case "view":
          const res = await Controller.Controller.Process({
                  actionName: actionName,
                  BUid: this.node.getElementById("stored-bus").value,
                  itemsName: this.node.getElementById("stored-items").value,
                  field: this.node.getElementById("fields").value,
                  pattern: this.node.getElementById("pattern").value,
                  query: this.node.getElementById("query").value,
                  useQuery: this.node.getElementById("use-query").checked,
                  isRegex: this.node.getElementById("is-regex").checked,
                  caseIns: this.node.getElementById("case-ins").checked
                });
          if(res) this.results.Populate(res);
          break;

        case "export-res":
          this.results.Export();
          break;

        case "load":
          await Controller.Controller.Process({actionName: actionName, itemsName: this.node.getElementById("load-items").value});
          break;
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
    if(ev.ctrlKey && ev.code === "Enter") {
      const search = this.node.getElementById("search");
      const importDE = this.node.getElementById("import-de");

      if(search.parentNode.style.display !== "none") search.click();
      else if(importDE.parentNode.style.display !== "none") importDE.click();
    }
  }

}

customElements.define("app-inputs", Inputs);