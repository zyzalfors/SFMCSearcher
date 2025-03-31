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
  cell.addEventListener("click", ev => SortResults(ev.target));
  row.appendChild(cell);
  for(const field in results[0]) {
    if(!item.tableFields.includes(field)) continue;
    const cell = document.createElement("th");
    cell.addEventListener("click", ev => SortResults(ev.target));
    cell.innerHTML = field;
    row.appendChild(cell);
  }
  table.appendChild(row);
  let n = 1;
  for(const result of results) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.innerHTML = n;
    row.appendChild(cell);
    for(const field in result) {
      if(!item.tableFields.includes(field)) continue;
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
  const BUid = document.getElementById("BUdata").value;
  const itemsName = document.getElementById("itemsNames").value;
  const field = document.getElementById("fields").value;
  const pattern = document.getElementById("pattern").value;
  const query = document.getElementById("query").value;
  const isRegex = document.getElementById("isRegex").checked;
  const caseIns = document.getElementById("caseIns").checked;
  try {
    const results = await Controller.Controller.Process(BUid, actionName, itemsName, pattern, query, isRegex, caseIns, field);
    if(results) PopulateResults(results);
  }
  catch(err) {
    console.log(err);
    window.alert(err);
  }
  finally {
    button.innerText = text;
    button.disabled = false;
    if(["load", "clear"].includes(actionName)) {
      await UpdateBUs();
      await UpdateGui();
    }
  }
}

async function UpdateFields() {
  const select = document.getElementById("fields");
  while(select.options.length > 0) select.remove(0);
  const itemsName = document.getElementById("itemsNames").value;
  const item = Controller.Controller.items.find(entry => entry.itemsName === itemsName);
  if(!item) return;
  for(const field of item.searchFields) {
    const option = document.createElement("option");
    option.value = field;
    option.text = field;
    select.appendChild(option);
  }
  await UpdateGui();
}

async function UpdateGui() {
  const BUid = document.getElementById("BUdata").value;
  const itemsName = document.getElementById("itemsNames").value;
  const storage = await Utility.Utility.GetStorage(BUid);
  const vis = Array.isArray(storage.data) && (
    (storage.i < 0 && storage.data.find(entry => entry[itemsName])) ||
    (storage.i > -1 && storage.data[storage.i][itemsName])) ? "" : "none";
  document.getElementById("clear").style.display = vis;
  document.getElementById("export").style.display = vis;
  document.getElementById("view").style.display = vis;
  document.getElementById("search").style.display = vis;
}

async function UpdateBUs() {
  const select = document.getElementById("BUdata");
  while(select.options.length > 0) select.remove(0);
  const storedBUdata = await Utility.Utility.GetStoredBUData();
  for(const entry of storedBUdata) {
    const option = document.createElement("option");
    option.text = entry.BUname + " (" + entry.BUid + ")";
    option.value = entry.BUid;
    select.appendChild(option);
  }
  if(storedBUdata.length > 1) {
    const option = document.createElement("option");
    option.text = "--All--";
    option.value = "";
    select.appendChild(option);
  }
  const currBU = document.getElementById("currBU");
  try {
    const currBUdata = await Utility.Utility.GetBUData();
    if(storedBUdata.find(entry => entry.BUid == currBUdata.BUid)) select.value = currBUdata.BUid;
    currBU.innerText = currBUdata.BUname + " (" + currBUdata.BUid + ")";
  }
  catch(err) {
    console.log(err);
  }
  finally {
    if(!currBU.innerText) currBU.innerText = "-";
  }
}

function UpdateQuery(select) {
  const queryArea = document.getElementById("query");
  const query = queryArea.value;
  const pos = queryArea.selectionStart;
  if(!query.trim()) return;
  document.getElementById("query").value = query.substring(0, pos) + select.value + query.substring(pos);
}

function ProcessKey(ev) {
  if(ev.ctrlKey || ["INPUT", "TEXTAREA"].includes(ev.target.tagName.toUpperCase())) return;
  let button;
  switch(ev.code) {
    case "KeyL":
      button = document.getElementById("load");
      break;
    case "KeyI":
      document.getElementById("import").click();
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
  if(button && !button.disabled && !button.style.display) Process(button);
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
      await UpdateBUs();
      await UpdateGui();
    }
    catch(err) {
      window.alert(err);
    }
  });
  reader.addEventListener("error", () => {
    window.alert("Error reading the file");
  });
  reader.readAsText(file);
}

async function InitGui() {
  document.getElementById("ver").innerText = chrome.runtime.getManifest().version;
  const select = document.getElementById("itemsNames");
  const items = Controller.Controller.items;
  for(const item of items) {
    const option = document.createElement("option");
    option.text = item.itemsName;
    option.value = item.itemsName;
    select.appendChild(option);
  }
  select.addEventListener("change", async () => await UpdateFields());
  document.getElementById("BUdata").addEventListener("change", async () => await UpdateGui());
  document.getElementById("itemsNames").addEventListener("change", ev => UpdateQuery(ev.target));
  document.getElementById("fields").addEventListener("change", ev => UpdateQuery(ev.target));
  document.addEventListener("keydown", ev => ProcessKey(ev));
  for(const button of document.getElementsByTagName("button")) button.addEventListener("click", async () => await Process(button));
  document.getElementById("import").addEventListener("change", ev => ProcessImport(ev.target));
  await UpdateBUs();
  await UpdateFields();
}

await InitGui();