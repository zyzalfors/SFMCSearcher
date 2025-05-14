import { Controller } from "./controller";

export class Utility {

  public static readonly storageFields: string[] = ["BUId", "BUName"];

  public static async Output(type: string, data: string, down: boolean = false, BUid: string = "", itemsName: string = ""): Promise<void> {
    let url: any;
    let name: any;

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
    else if(down) await chrome.downloads.download({url: url, filename: name, conflictAction: "uniquify", saveAs: true});
    else await chrome.tabs.create({url: url});
  }

  public static async FetchJSON(url: string, method: string = "", body: any = null, token: string = ""): Promise<any> {
    const resp: Response = method && body ? await fetch(url, {"method": method.toUpperCase(), "headers": {"Content-Type": "application/json", "x-csrf-token": token}, "body": JSON.stringify(body)}) : await fetch(url);
    return await resp.json();
  }

  public static async FetchHTML(url: string): Promise<string> {
    const resp: Response = await fetch(url);
    return await resp.text();
  }

  public static async GetSiteStack(): Promise<string> {
    const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({});

    for(const tab of tabs) {
      if(tab.url && tab.url.includes("exacttarget.com")) {
        const matches: RegExpMatchArray | null = tab.url.match(/\d+/);
        if(matches) return matches[0];
      }
    }

    return "";
  }

  public static async GetSiteBUData(stack: string = ""): Promise<any> {
    if(!stack) stack = await Utility.GetSiteStack();
    const BUdata: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/platform-internal/v1/accounts/@current`);
    return {BUid: BUdata.accountId, BUname: BUdata.name};
  }

  public static async GetData(BUid: string = ""): Promise<any> {
    const storage: any = await chrome.storage.local.get();
    const data: any = storage["data"];
    const i: number = Array.isArray(data) ? data.findIndex((entry: any) => entry.BUId == BUid) : -1;
    return {data, i};
  }

  public static async GetBUData(): Promise<any[]> {
    const storage: any = await Utility.GetData();
    if(!Array.isArray(storage.data)) return [];

    const data: any[] = [];
    storage.data.forEach((entry: any) => data.push({BUid: entry.BUId, BUname: entry.BUName}));

    return data;
  }

  public static async StoreData(BUid: string, BUname: string, itemsName: string, items: any): Promise<void> {
    if(!Array.isArray(items) || items.length === 0) return;
    const storage: any = await Utility.GetData(BUid);

    if(!Array.isArray(storage.data)) {
      const data: any = {BUId: BUid, BUName: BUname};
      data[itemsName] = {Size: items.length, Items: items};
      storage.data = [data];
    }
    else if(storage.i < 0) {
      const data: any = {BUId: BUid, BUName: BUname};
      data[itemsName] = {Size: items.length, Items: items};
      storage.data.push(data);
    }
    else {
      const storedItems: any = storage.data[storage.i][itemsName] ? storage.data[storage.i][itemsName].Items : [];
      items.forEach((entry: any) => storedItems.push(entry));
      storage.data[storage.i][itemsName] = {Size: storedItems.length, Items: storedItems};
    }

    await chrome.storage.local.set({data: storage.data});
  }

  public static async ImportData(data: any): Promise<void> {
    if(!Array.isArray(data)) data = [data];

    for(const entry of data) {
      for(const field in entry) {
        if(Utility.storageFields.includes(field) || !Controller.items.find((entry: any) => entry.itemsName === field)) continue;
        await Utility.StoreData(entry.BUId, entry.BUName, field, entry[field].Items);
      }
    }
  }

  public static async ClearData(BUid: string, itemsName: string): Promise<void> {
    const storage: any = await Utility.GetData(BUid);
    if(!Array.isArray(storage.data)) return;
    const n: number = Utility.storageFields.length;

    if(!BUid) {
      for(let i: number = 0; i < storage.data.length; i++) {
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

    await chrome.storage.local.set({data: storage.data});
  }

  public static async ReadData(actionName: string, BUid: string, itemsName: string): Promise<void> {
    const storage: any = await Utility.GetData(BUid);
    if(!Array.isArray(storage.data)) return;

    const n: number = Utility.storageFields.length;
    const fields: string[] = [...Utility.storageFields];
    fields.push(itemsName);

    let data: any;
    if(!BUid) {
      for(let i: number = 0; i < storage.data.length; i++) {
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
    else if(actionName === "export") await Utility.Output("json", data, true, BUid, itemsName);
    else if(actionName === "view") await Utility.Output("json", data);
  }

  public static GetFullPath(categoryId: number, folders: any[], item: any = null): string {
    const parts: string[] = [];
    let id: number = categoryId;

    while(id > 0) {
      const folder: any = folders.find((entry: any) => entry.id == id || entry.categoryId == id);

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

  public static SanitizeObj(o: any): any {
    for(const f in o) {
      if(o[f] === undefined || o[f] === null) o[f] = "";
    }
    return o;
  }

  public static SanitizeXml(xml: string): string {
    return xml ? xml.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  }

  public static FindCaseIns(arr: string[], val: string): string | undefined {
    return arr.find((entry: string) => entry.toLowerCase() === val.toLowerCase());
  }
}