import * as Utility from "/Logics/utility.js";
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

  const results = new Results.Results();
  const inputs = new Inputs.Inputs(results);
  const header = new Header.Header({
          name: manifest.name,
          ver: manifest.version,
          BUname: data?.BUname,
          BUid: data?.BUid,
          logo: "/Gui/Sources/logo.png",
          search: "/Gui/Sources/search.png",
          load: "/Gui/Sources/load.png",
          exp: "/Gui/Sources/export.png",
          deimp: "/Gui/Sources/deimport.png",
          inputs: inputs
        });
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