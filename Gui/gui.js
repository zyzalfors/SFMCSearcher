import * as Utility from "../Logics/utility.js";
import * as Controller from "../Logics/controller.js";

function SortResults(th) {
  const index = th.cellIndex;
  const table = document.getElementById("results");
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

function PopulateResults(results) {
  const table = document.getElementById("results");
  table._asc = true;
  while(table.rows.length > 0) table.deleteRow(0);

  if(results.length === 0) return;

  const item = Controller.Controller.items.find(entry => entry.type === results[0].Type);
  if(!item) return;

  const row = document.createElement("tr");
  const cell = document.createElement("th");
  cell.innerHTML = results[0].Type;
  cell.addEventListener("click", ev => SortResults(ev.target));
  row.appendChild(cell);

  const fields = Object.keys(results[0]);

  for(const field of item.tableFields) {
    if(!fields.includes(field)) continue;
    const cell = document.createElement("th");
    cell.innerHTML = field;
    cell.addEventListener("click", ev => SortResults(ev.target));
    row.appendChild(cell);
  }
  table.appendChild(row);

  let n = 1;
  for(const result of results) {
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

async function Process(button) {
  const actionName = button.id;
  const text = button.innerText;
  button.innerText += "ing...";
  button.disabled = true;

  try {
    switch(actionName) {
      case "import":
        document.getElementById("imp").click();
        break;

      case "clear": case "export": case "search": case "view":  {
        const BUid = document.getElementById("stored-budata").value;
        const itemsName = document.getElementById("stored-itemsnames").value;
        const field = document.getElementById("itemfields").value;
        const pattern = document.getElementById("pattern").value;
        const query = document.getElementById("query").value;
        const isRegex = document.getElementById("isregex").checked;
        const caseIns = document.getElementById("caseins").checked;
        const results = await Controller.Controller.Process(BUid, actionName, itemsName, pattern, query, isRegex, caseIns, field);
        if(results) PopulateResults(results);
      }
      break;

      default: {
        const itemsName = document.getElementById("load-itemsnames").value;
        await Controller.Controller.Process(null, actionName, itemsName);
      }
    }
  }
  catch(err) {
    console.log(err);
    window.alert(err);
  }
  finally {
    button.innerText = text;
    button.disabled = false;
    if(["load", "clear"].includes(actionName)) await InitBUData();
  }
}

function ProcessKey(ev) {
  if(ev.ctrlKey || ["INPUT", "TEXTAREA"].includes(ev.target.tagName.toUpperCase())) return;

  let button;
  switch(ev.code) {
    case "KeyL":
      button = document.getElementById("load");
      break;

    case "KeyI":
      button = document.getElementById("imp");
      break;

    case "KeyC":
      button = document.getElementById("clear");
      break;

    case "KeyE":
      button = document.getElementById("export");
      break;

    case "KeyV":
      button = document.getElementById("view");
      break;

    case "Enter":
      button = document.getElementById("search");
      break;
  }

  if(button && !button.disabled) button.click();
}

function ProcessImport(input) {
  const file = input.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.addEventListener("load", async () => {
    try {
      const action = Controller.Controller.actions.find(entry => entry.name === "import");
      if(!action) return;

      await action.proc(JSON.parse(reader.result));
      await InitBUData();
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

function InitItemFields() {
  const itemFields = document.getElementById("itemfields");
  while(itemFields.options.length > 0) itemFields.remove(0);

  const itemsName = document.getElementById("stored-itemsnames").value;
  const item = Controller.Controller.items.find(entry => entry.itemsName === itemsName);
  if(!item) return;

  for(const field of item.searchFields) {
    const option = document.createElement("option");
    option.value = field;
    option.text = field;
    itemFields.appendChild(option);
  }
}

async function InitItemsNames() {
  const itemsNames = document.getElementById("stored-itemsnames");
  while(itemsNames.options.length > 0) itemsNames.remove(0);

  const BUid = document.getElementById("stored-budata").value;
  const storage = await Utility.Utility.GetStorage(BUid);

  let data = [];
  if(!Array.isArray(storage.data)) data = [];
  else if(!BUid) data = storage.data;
  else if(storage.i > -1) data = [storage.data[storage.i]];

  const fields = [...Utility.Utility.storageFields];

  for(const entry of data) {
    for(const field in entry) {
      if(fields.includes(field)) continue;
      fields.push(field);

      const option = document.createElement("option");
      option.value = field;
      option.text = field;
      itemsNames.appendChild(option);
    }
  }

  InitItemFields();
}

async function InitBUData() {
  const BUdata = document.getElementById("stored-budata");
  while(BUdata.options.length > 0) BUdata.remove(0);

  const data = await Utility.Utility.GetStoredBUData();
  if(data.length > 1) {
    const option = document.createElement("option");
    option.text = "--All--";
    option.value = "";
    BUdata.appendChild(option);
  }

  for(const entry of data) {
    const option = document.createElement("option");
    option.text = `${entry.BUname} (${entry.BUid})`;
    option.value = entry.BUid;
    BUdata.appendChild(option);
  }

  await InitItemsNames();
}

function InitSearchGui() {
  for(const div of document.getElementsByClassName("load")) div.style.display = "none";
  for(const div of document.getElementsByClassName("export")) div.style.display = "none";
  for(const div of document.getElementsByClassName("search")) div.style.display = "";
}

function InitLoadGui() {
  for(const div of document.getElementsByClassName("search")) div.style.display = "none";
  for(const div of document.getElementsByClassName("export")) div.style.display = "none";
  for(const div of document.getElementsByClassName("load")) div.style.display = "";
}

function InitExportGui() {
  for(const div of document.getElementsByClassName("load")) div.style.display = "none";
  for(const div of document.getElementsByClassName("search")) div.style.display = "none";
  for(const div of document.getElementsByClassName("export")) div.style.display = "";
}

async function InitGui() {
  try {
    document.getElementById("name").innerText += ` v${chrome.runtime.getManifest().version}`;

    const data = await Utility.Utility.GetBUData();
    document.getElementById("bu").innerText = `${data.BUname} (${data.BUid})`;

    document.getElementById("search-img").addEventListener("click", () => InitSearchGui());
    document.getElementById("load-img").addEventListener("click", () => InitLoadGui());
    document.getElementById("export-img").addEventListener("click", () => InitExportGui());

    document.getElementById("stored-budata").addEventListener("change", async () => await InitItemsNames());
    document.getElementById("stored-itemsnames").addEventListener("change", () => InitItemFields());

    const itemsNames = document.getElementById("load-itemsnames");
    for(const item of Controller.Controller.items) {
      const option = document.createElement("option");
      option.text = item.itemsName;
      option.value = item.itemsName;
      itemsNames.appendChild(option);
    }

    for(const btn of document.getElementsByTagName("button")) btn.addEventListener("click", async ev => await Process(ev.target));
    document.getElementById("imp").addEventListener("change", ev => ProcessImport(ev.target));
    document.addEventListener("keydown", ev => ProcessKey(ev));

    await InitBUData();
  }
  catch(err) {
    console.log(err);
  }
}

await InitGui();
