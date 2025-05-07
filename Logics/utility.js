import * as Controller from "/Logics/controller.js";

export class Utility {

  static storageFields = ["BUId", "BUName"];

  static Output(type, data, down, BUid, itemsName) {
    let url, name;

    switch(type) {
      case "json":
        url = `data:application/json,${encodeURIComponent(JSON.stringify(data, null, 1))}`;
        name = `sfmcs_${BUid}_${itemsName}.json`;
        break;

      case "sv":
        url = `data:text/csv,${encodeURIComponent(data)}`;
        name = `sfmcs_${itemsName}.csv`;
        break;
    }

    if(!url || !name) return;
    else if(down) chrome.downloads.download({url: url, filename: name, conflictAction: "uniquify", saveAs: true});
    else chrome.tabs.create({url: url});
  }

  static async FetchJSON(url, method, body, token) {
    try {
      const resp = method && body ? await fetch(url, {"method": method.toUpperCase(), "headers": {"Content-Type": "application/json", "x-csrf-token": token}, "body": JSON.stringify(body)}) : await fetch(url);
      return await resp.json();
    }
    catch {}
  }

  static async FetchHTML(url) {
    const resp = await fetch(url);
    return await resp.text();
  }

  static async GetStack() {
    const tabs = await chrome.tabs.query({});
    for(const tab of tabs) {
      if(tab.url.includes("exacttarget.com")) return tab.url.match(/\d+/)[0];
    }
  }

  static async GetBUData(stack) {
    if(!stack) stack = await Utility.GetStack();
    const BUdata = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/platform-internal/v1/accounts/@current`);
    return {BUid: BUdata.accountId, BUname: BUdata.name};
  }

  static async GetStorage(BUid) {
    const data = (await chrome.storage.local.get()).data;
    const i = Array.isArray(data) ? data.findIndex(entry => entry.BUId == BUid) : -1;
    return {data, i};
  }

  static async GetStoredBUData() {
    const storage = await Utility.GetStorage();
    if(!Array.isArray(storage.data)) return [];

    const data = [];
    for(const entry of storage.data) data.push({BUid: entry.BUId, BUname: entry.BUName});

    return data;
  }

  static async SetStorage(BUid, BUname, itemsName, items) {
    if(!Array.isArray(items) || items.length === 0) return;

    const storage = await Utility.GetStorage(BUid);

    if(!Array.isArray(storage.data)) {
      const data = {BUId: BUid, BUName: BUname};
      data[itemsName] = {Size: items.length, Items: items};
      storage.data = [data];
    }
    else if(storage.i < 0) {
      const data = {BUId: BUid, BUName: BUname};
      data[itemsName] = {Size: items.length, Items: items};
      storage.data.push(data);
    }
    else {
      const storedItems = storage.data[storage.i][itemsName] ? storage.data[storage.i][itemsName].Items : [];
      items.forEach(entry => storedItems.push(entry));
      storage.data[storage.i][itemsName] = {Size: storedItems.length, Items: storedItems};
    }

    chrome.storage.local.set({data: storage.data});
  }

  static async ImportStorage(data) {
    if(!Array.isArray(data)) data = [data];

    for(const entry of data) {
      for(const field in entry) {
        if(Utility.storageFields.includes(field) || !Controller.Controller.items.find(entry => entry.itemsName === field)) continue;
        await Utility.SetStorage(entry.BUId, entry.BUName, field, entry[field].Items);
      }
    }
  }

  static async ClearStorage(BUid, itemsName) {
    const storage = await Utility.GetStorage(BUid);
    if(!Array.isArray(storage.data)) return;

    const n = Utility.storageFields.length;

    if(!BUid) {
      for(let i = 0; i < storage.data.length; i++) {
        delete storage.data[i][itemsName];
        if(Object.keys(storage.data[i]).length === n) {
          storage.data.splice(i, 1);
          i--;
        }
      }
    }
    else if(storage.i > -1) {
      delete storage.data[storage.i][itemsName];
      if(Object.keys(storage.data[storage.i]).length === n) storage.data.splice(storage.i, 1);
    }
    else return;

    chrome.storage.local.set({data: storage.data});
  }

  static async ReadStorage(actionName, BUid, itemsName) {
    const storage = await Utility.GetStorage(BUid);
    if(!Array.isArray(storage.data)) return;

    const n = Utility.storageFields.length;
    const fields = [...Utility.storageFields];
    fields.push(itemsName);

    let data;
    if(!BUid) {
      for(let i = 0; i < storage.data.length; i++) {
        for(const field of Object.keys(storage.data[i])) {
          if(!fields.includes(field)) delete storage.data[i][field];
        }

        if(Object.keys(storage.data[i]).length === n) {
          storage.data.splice(i, 1);
          i--;
        }
      }
      if(storage.data.length > 0) data = storage.data;
    }
    else if(storage.i > -1) {
      for(const field of Object.keys(storage.data[storage.i])) {
        if(!fields.includes(field)) delete storage.data[storage.i][field];
      }

      if(Object.keys(storage.data[storage.i]).length === n) storage.data.splice(storage.i, 1);
      if(storage.data.length > 0) data = storage.data[storage.i];
    }

    if(!data) return;
    else if(actionName === "export") Utility.Output("json", data, true, BUid, itemsName);
    else if(actionName === "view") Utility.Output("json", data);
  }

  static GetFullPath(categoryId, folders, item) {
    const parts = [];
    let id = categoryId;

    while(id > 0) {
      const folder = folders.find(entry => entry.id == id || entry.categoryId == id);

      if(folder) {
        parts.push(folder.name);
        id = folder.parentId;
      }
      else {
        if(item && item.category) parts.push(item.category.name);
        break;
      }
    }

    return parts.reverse().join(" > ");
  }

  static SanitizeObj(o) {
    for(const f in o) {
      if(o[f] === undefined || o[f] === null) o[f] = "";
    }
  }

  static SanitizeXml(xml) {
    return xml ? xml.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  }

  static FindCaseIns(arr, val) {
    return arr.find(entry => entry.toLowerCase() === val.toLowerCase());
  }

}