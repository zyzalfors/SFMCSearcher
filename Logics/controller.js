import * as Utility from "./utility.js";
import * as QueryParser from "./queryparser.js";
import * as Asset from "../Items/asset.js";
import * as AttributeGroup from "../Items/attributegroup.js";
import * as Automation from "../Items/automation.js";
import * as Cloudpage from "../Items/cloudpage.js";
import * as CustomerJourney from "../Items/customerjourney.js";
import * as DataExtension from "../Items/dataextension.js";
import * as DataExtract from "../Items/dataextract.js";
import * as FileTransfer from "../Items/filetransfer.js";
import * as Filter from "../Items/filter.js";
import * as FilterDefinition from "../Items/filterdefinition.js";
import * as Import from "../Items/import.js";
import * as Message from "../Items/message.js";
import * as Package from "../Items/package.js";
import * as Query from "../Items/query.js";
import * as Script from "../Items/script.js";

export class Controller {

  static items = [{
                    itemsName: Asset.Asset.itemsName,
                    type: Asset.Asset.type,
                    tableFields: Asset.Asset.tableFields,
                    searchFields: Asset.Asset.searchFields,
                    load: async (stack, BUid, BUname) => await Asset.Asset.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Asset.Asset.Check(item, field, regex)
                  },
                  {
                    itemsName: AttributeGroup.AttributeGroup.itemsName,
                    type: AttributeGroup.AttributeGroup.type,
                    tableFields: AttributeGroup.AttributeGroup.tableFields,
                    searchFields: AttributeGroup.AttributeGroup.searchFields,
                    load: async (stack, BUid, BUname) => await AttributeGroup.AttributeGroup.Load(stack, BUid, BUname),
                    check: (item, field, regex) => AttributeGroup.AttributeGroup.Check(item, field, regex)
                  },
                  {
                    itemsName: Automation.Automation.itemsName,
                    type: Automation.Automation.type,
                    tableFields: Automation.Automation.tableFields,
                    searchFields: Automation.Automation.searchFields,
                    load: async (stack, BUid, BUname) => await Automation.Automation.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Automation.Automation.Check(item, field, regex)
                  },
                  {
                    itemsName: Cloudpage.Cloudpage.itemsName,
                    type: Cloudpage.Cloudpage.type,
                    tableFields: Cloudpage.Cloudpage.tableFields,
                    searchFields: Cloudpage.Cloudpage.searchFields,
                    load: async (stack, BUid, BUname) => await Cloudpage.Cloudpage.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Cloudpage.Cloudpage.Check(item, field, regex)
                  },
                  {
                    itemsName: CustomerJourney.CustomerJourney.itemsName,
                    type: CustomerJourney.CustomerJourney.type,
                    tableFields: CustomerJourney.CustomerJourney.tableFields,
                    searchFields: CustomerJourney.CustomerJourney.searchFields,
                    load: async (stack, BUid, BUname) => await CustomerJourney.CustomerJourney.Load(stack, BUid, BUname),
                    check: (item, field, regex) => CustomerJourney.CustomerJourney.Check(item, field, regex)
                  },
                  {
                    itemsName: DataExtension.DataExtension.itemsName,
                    type: DataExtension.DataExtension.type,
                    tableFields: DataExtension.DataExtension.tableFields,
                    searchFields: DataExtension.DataExtension.searchFields,
                    load: async (stack, BUid, BUname) => await DataExtension.DataExtension.Load(stack, BUid, BUname),
                    check: (item, field, regex) => DataExtension.DataExtension.Check(item, field, regex)
                  },
                  {
                    itemsName: DataExtract.DataExtract.itemsName,
                    type: DataExtract.DataExtract.type,
                    tableFields: DataExtract.DataExtract.tableFields,
                    searchFields: DataExtract.DataExtract.searchFields,
                    load: async (stack, BUid, BUname) => await DataExtract.DataExtract.Load(stack, BUid, BUname),
                    check: (item, field, regex) => DataExtract.DataExtract.Check(item, field, regex)
                  },
                  {
                    itemsName: FileTransfer.FileTransfer.itemsName,
                    type: FileTransfer.FileTransfer.type,
                    tableFields: FileTransfer.FileTransfer.tableFields,
                    searchFields: FileTransfer.FileTransfer.searchFields,
                    load: async (stack, BUid, BUname) => await FileTransfer.FileTransfer.Load(stack, BUid, BUname),
                    check: (item, field, regex) => FileTransfer.FileTransfer.Check(item, field, regex)
                  },
                  {
                    itemsName: Filter.Filter.itemsName,
                    type: Filter.Filter.type,
                    tableFields: Filter.Filter.tableFields,
                    searchFields: Filter.Filter.searchFields,
                    load: async (stack, BUid, BUname) => await Filter.Filter.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Filter.Filter.Check(item, field, regex)
                  },
                  {
                    itemsName: FilterDefinition.FilterDefinition.itemsName,
                    type: FilterDefinition.FilterDefinition.type,
                    tableFields: FilterDefinition.FilterDefinition.tableFields,
                    searchFields: FilterDefinition.FilterDefinition.searchFields,
                    load: async (stack, BUid, BUname) => await FilterDefinition.FilterDefinition.Load(stack, BUid, BUname),
                    check: (item, field, regex) => FilterDefinition.FilterDefinition.Check(item, field, regex)
                  },
                  {
                    itemsName: Import.Import.itemsName,
                    type: Import.Import.type,
                    tableFields: Import.Import.tableFields,
                    searchFields: Import.Import.searchFields,
                    load: async (stack, BUid, BUname) => await Import.Import.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Import.Import.Check(item, field, regex)
                  },
                  {
                    itemsName: Message.Message.itemsName,
                    type: Message.Message.type,
                    tableFields: Message.Message.tableFields,
                    searchFields: Message.Message.searchFields,
                    load: async (stack, BUid, BUname) => await Message.Message.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Message.Message.Check(item, field, regex)
                  },
                  {
                    itemsName: Package.Package.itemsName,
                    type: Package.Package.type,
                    tableFields: Package.Package.tableFields,
                    searchFields: Package.Package.searchFields,
                    load: async (stack, BUid, BUname) => await Package.Package.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Package.Package.Check(item, field, regex)
                  },
                  {
                    itemsName: Query.Query.itemsName,
                    type: Query.Query.type,
                    tableFields: Query.Query.tableFields,
                    searchFields: Query.Query.searchFields,
                    load: async (stack, BUid, BUname) => await Query.Query.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Query.Query.Check(item, field, regex)
                  },
                  {
                    itemsName: Script.Script.itemsName,
                    type: Script.Script.type,
                    tableFields: Script.Script.tableFields,
                    searchFields: Script.Script.searchFields,
                    load: async (stack, BUid, BUname) => await Script.Script.Load(stack, BUid, BUname),
                    check: (item, field, regex) => Script.Script.Check(item, field, regex)
                  }
                 ];

  static actions = [{
                      name: "clear",
                      proc: async (BUid, itemsName, pattern, query, isRegex, caseIns, field) => await Utility.Utility.ClearStorage(BUid, itemsName)
                    },
                    {
                      name: "export",
                      proc: async (BUid, itemsName, pattern, query, isRegex, caseIns, field) => await Utility.Utility.ReadStorage(BUid, "export", itemsName)
                    },
                    {
                      name: "import",
                      proc: async data => await Controller.ImportData(data)
                    },
                    {
                      name: "load",
                      proc: async (BUid, itemsName, pattern, query, isRegex, caseIns, field) => await Controller.LoadData(itemsName)
                    },
                    {
                      name: "search",
                      proc: async (BUid, itemsName, pattern, query, isRegex, caseIns, field) => await Controller.SearchData(BUid, itemsName, pattern, query, isRegex, caseIns, field)
                    },
                    {
                      name: "view",
                      proc: async (BUid, itemsName, pattern, query, isRegex, caseIns, field) => await Utility.Utility.ReadStorage(BUid, "view", itemsName)
                    }
                   ];

  static async Process(BUid, actionName, itemsName, pattern, query, isRegex, caseIns, field) {
    const action = Controller.actions.find(entry => entry.name === actionName);
    if(!action) return;
    return await action.proc(BUid, itemsName, pattern, query, isRegex, caseIns, field);
  }

  static async LoadData(itemsName) {
    const item = Controller.items.find(entry => entry.itemsName === itemsName);
    if(!item) return;
    const stack = await Utility.Utility.GetStack();
    const BUdata = await Utility.Utility.GetBUData(stack);
    await Utility.Utility.ClearStorage(BUdata.BUid, itemsName);
    await item.load(stack, BUdata.BUid, BUdata.BUname);
  }

  static async ReadData(BUid, itemsName) {
    const storage = await Utility.Utility.GetStorage(BUid);
    if(!Array.isArray(storage.data)) return [];
    const items = [];
    if(!BUid) {
      for(const i in storage.data) {
        if(storage.data[i][itemsName]) items.push(...storage.data[i][itemsName].Items);
      }
    }
    else if(storage.i > -1 && storage.data[storage.i][itemsName]) items.push(...storage.data[storage.i][itemsName].Items);
    return items;
  }

  static async ImportData(data) {
    await Utility.Utility.ImportStorage(data);
  }

  static async SearchDataByQuery(BUid, query, isRegex, caseIns) {
    const Check = (item, where, check) => {
      if(typeof where === "object") {
        if(where.op === "AND") return Check(item, where.left, check) && Check(item, where.right, check);
        if(where.op === "OR") return Check(item, where.left, check) || Check(item, where.right, check);
      }
      return check(item, where.field, where.regex);
    };
    const parsed = new QueryParser.QueryParser(query).Parse(isRegex, caseIns);
    const item = Controller.items.find(entry => entry.itemsName.toLowerCase() === parsed.from.toLowerCase());
    if(!item) return [];
    const items = await Controller.ReadData(BUid, item.itemsName);
    if(items.length === 0) return [];
    const fields = ["Type"];
    if(!parsed.fields.includes("*")) {
      for(const parsedField of parsed.fields) {
        const itemField = Utility.Utility.FindCaseIns(item.tableFields, parsedField);
        if(itemField) fields.push(itemField);
      }
      if(fields.length === 1) return [];
    }
    const filtered = parsed.where ? items.filter(entry => Check(entry, parsed.where, item.check)) : items;
    if(!parsed.fields.includes("*")) {
      for(const entry of filtered) {
        for(const field of Object.keys(entry)) {
          if(!fields.includes(field)) delete entry[field];
        }
      }
    }
    return filtered;
  }

  static async SearchDataByInput(BUid, itemsName, pattern, isRegex, caseIns, field) {
    const items = await Controller.ReadData(BUid, itemsName);
    if(items.length === 0) return [];
    const item = Controller.items.find(entry => entry.type === items[0].Type);
    if(!item) return [];
    if(!isRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = caseIns ? new RegExp(pattern, "i") : new RegExp(pattern);
    return items.filter(entry => item.check(entry, field, regex));
  }

  static async SearchData(BUid, itemsName, pattern, query, isRegex, caseIns, field) {
    if(query) return await Controller.SearchDataByQuery(BUid, query, isRegex, caseIns);
    return await Controller.SearchDataByInput(BUid, itemsName, pattern, isRegex, caseIns, field);
  }

}