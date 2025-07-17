import { DEImporter } from "./deimporter";
import { QueryParser } from "./queryparser";
import { Utility } from "./utility";
import { Asset } from "../Items/asset";
import { AttributeGroup } from "../Items/attributegroup";
import { Automation } from "../Items/automation";
import { Cloudpage } from "../Items/cloudpage";
import { CustomerJourney } from "../Items/customerjourney";
import { DataExtension } from "../Items/dataextension";
import { DataExtract } from "../Items/dataextract";
import { FileTransfer } from "../Items/filetransfer";
import { Filter } from "../Items/filter";
import { FilterDefinition } from "../Items/filterdefinition";
import { Image } from "../Items/image";
import { Import } from "../Items/import";
import { JourneyHistoryEntry } from "../Items/journeyhistoryentry";
import { Message } from "../Items/message";
import { Package } from "../Items/package";
import { Query } from "../Items/query";
import { Script } from "../Items/script";

export class Controller {

  public static readonly items: any[] = [
    {class: Asset},
    {class: AttributeGroup},
    {class: Automation},
    {class: Cloudpage},
    {class: CustomerJourney},
    {class: DataExtension},
    {class: DataExtract},
    {class: FileTransfer},
    {class: Filter},
    {class: FilterDefinition},
    {class: Image},
    {class: Import},
    {class: JourneyHistoryEntry},
    {class: Message},
    {class: Package},
    {class: Query},
    {class: Script}
  ];

  public static readonly actions: any[] = [
    {name: "clear", Proc: async (inp: any) => await Utility.ClearData(inp.BUid, inp.itemsName)},
    {name: "export", Proc: async (inp: any) => await Utility.ReadData("export", inp.BUid, inp.itemsName)},
    {name: "import", Proc: async (inp: any) => await Utility.ImportData(inp)},
    {name: "load", Proc: async (inp: any) => await Controller.LoadData(inp.itemsName)},
    {name: "search", Proc: async (inp: any) => await Controller.SearchData(inp.BUid, inp.itemsName, inp.field, inp.pattern, inp.query, inp.useQuery, inp.isRegex, inp.caseIns)},
    {name: "view", Proc: async (inp: any) => await Utility.ReadData("view", inp.BUid, inp.itemsName)},
    {name: "deimport", Proc: async (inp: any) => await Controller.ImportDEData(inp)}
  ];

  public static async Process(inp: any): Promise<any> {
    const action: any = Controller.actions.find((entry: any) => entry.name === inp.actionName);
    if(!action) return;

    return await action.Proc(inp);
  }

  private static async LoadData(itemsName: string): Promise<void> {
    const item: any = Controller.items.find((entry: any) => entry.class.itemsName === itemsName);
    if(!item) return;

    const stack: string = await Utility.GetSiteStack();
    const BUdata: any = await Utility.GetSiteBUData(stack);

    await Utility.ClearData(BUdata.BUid, itemsName);
    await item.class.Load(stack, BUdata.BUid, BUdata.BUname);
  }

  private static async ReadData(BUid: string, itemsName: string): Promise<any[]> {
    const storage: any = await Utility.GetData(BUid);
    if(!Array.isArray(storage.data)) return [];

    const items: any[] = [];
    if(!BUid) {
      for(const i in storage.data) {
        if(storage.data[i][itemsName]) storage.data[i][itemsName].Items.forEach((entry: any) => items.push(entry));
      }
    }
    else if(storage.i > -1 && storage.data[storage.i][itemsName]) storage.data[storage.i][itemsName].Items.forEach((entry: any) => items.push(entry));

    return items;
  }

  private static async SearchDataByQuery(query: string, isRegex: boolean, caseIns: boolean): Promise<any[]> {
    const parsed: any = new QueryParser(query).Parse(isRegex, caseIns);
    const item: any = Controller.items.find((entry: any) => entry.class.itemsName.toLowerCase() === parsed.from.toLowerCase());
    if(!item) return [];

    const items: any[] = await Controller.ReadData("", item.class.itemsName);
    if(items.length === 0) return [];

    const fields: string[] = ["Type"];
    if(!parsed.fields.includes("*")) {
      for(const parsedField of parsed.fields) {
        const itemField: string | undefined = Utility.FindCaseIns(item.class.tableFields, parsedField);
        if(itemField) fields.push(itemField);
      }
      if(fields.length === 1) return [];
    }

    const filtered: any[] = parsed.where ? items.filter((entry: any) => QueryParser.CheckWhere(entry, parsed.where, item.class.Check)) : items;
    if(!parsed.fields.includes("*")) {
      for(const item of filtered) {
        for(const field of Object.keys(item)) {
          if(!fields.includes(field)) delete item[field];
        }
      }
    }

    return filtered;
  }

  private static async SearchDataByInput(BUid: string, itemsName: string, field: string, pattern: string, isRegex: boolean, caseIns: boolean): Promise<any[]> {
    const items: any[] = await Controller.ReadData(BUid, itemsName);
    if(items.length === 0) return [];

    const item: any = Controller.items.find((entry: any) => entry.class.type === items[0].Type);
    if(!item) return [];

    if(!isRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex: RegExp = caseIns ? new RegExp(pattern, "i") : new RegExp(pattern);

    return items.filter((entry: any) => item.class.Check(entry, field, regex));
  }

  private static async SearchData(BUid: string, itemsName: string, field: string, pattern: string, query: string, useQuery: boolean, isRegex: boolean, caseIns: boolean): Promise<any[]> {
    if(useQuery) return await Controller.SearchDataByQuery(query, isRegex, caseIns);
    return await Controller.SearchDataByInput(BUid, itemsName, field, pattern, isRegex, caseIns);
  }

  private static async ImportDEData(inp: any): Promise<void> {
    const stack: string = await Utility.GetSiteStack();
    await DEImporter.Import(stack, inp.DEname, inp.data, inp.sep, inp.chunkSize, inp.method);
  }
}