import * as Utility from "/Logics/utility.js";
import * as Controller from "/Logics/controller.js";
import * as Header from "/Gui/Components/header.js";
import * as Inputs from "/Gui/Components/inputs.js";
import * as Results from "/Gui/Components/results.js";

async function GetBUData() {
  try {
    return await Utility.Utility.GetBUData();
  }
  catch(err) {
    console.log(err);
  }
}

async function InitGui() {
  const manifest = chrome.runtime.getManifest();
  const data = await GetBUData();

  const results = new Results.Results(Controller.Controller);
  const inputs = new Inputs.Inputs(results, Utility.Utility, Controller.Controller);

  const header = new Header.Header(manifest.name, manifest.version, data?.BUname, data?.BUid, "./Sources/logo.png", "./Sources/search.png", "./Sources/load.png", "./Sources/export.png", inputs);
  document.body.appendChild(header);

  const div = document.createElement("div");
  div.classList.add("entry");
  div.appendChild(inputs);
  div.appendChild(results);
  document.body.appendChild(div);

  document.addEventListener("keydown", ev => {
    header.ProcessKey(ev);
    inputs.ProcessKey(ev);
  });

  await inputs.InitBUs();
}

document.addEventListener("DOMContentLoaded", async () => await InitGui());