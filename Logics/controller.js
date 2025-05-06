import * as DEImporter from "/Logics/deimporter.js";
import * as QueryParser from "/Logics/queryparser.js";
import * as Utility from "/Logics/utility.js";
import * as Asset from "/Items/asset.js";
import * as AttributeGroup from "/Items/attributegroup.js";
import * as Automation from "/Items/automation.js";
import * as Cloudpage from "/Items/cloudpage.js";
import * as CustomerJourney from "/Items/customerjourney.js";
import * as DataExtension from "/Items/dataextension.js";
import * as DataExtract from "/Items/dataextract.js";
import * as FileTransfer from "/Items/filetransfer.js";
import * as Filter from "/Items/filter.js";
import * as FilterDefinition from "/Items/filterdefinition.js";
import * as Import from "/Items/import.js";
import * as JourneyHistoryEntry from "/Items/journeyhistoryentry.js";
import * as Message from "/Items/message.js";
import * as Package from "/Items/package.js";
import * as Query from "/Items/query.js";
import * as Script from "/Items/script.js";

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
                    itemsName: JourneyHistoryEntry.JourneyHistoryEntry.itemsName,
                    type: JourneyHistoryEntry.JourneyHistoryEntry.type,
                    tableFields: JourneyHistoryEntry.JourneyHistoryEntry.tableFields,
                    searchFields: JourneyHistoryEntry.JourneyHistoryEntry.searchFields,
                    load: async (stack, BUid, BUname) => await JourneyHistoryEntry.JourneyHistoryEntry.Load(stack, BUid, BUname),
                    check: (item, field, regex) => JourneyHistoryEntry.JourneyHistoryEntry.Check(item, field, regex)
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
                      proc: async inp => await Utility.Utility.ClearStorage(inp.BUid, inp.itemsName)
                    },
                    {
                      name: "export",
                      proc: async inp => await Utility.Utility.ReadStorage("export", inp.BUid, inp.itemsName)
                    },
                    {
                      name: "import",
                      proc: async inp => await Controller.ImportData(inp)
                    },
                    {
                      name: "load",
                      proc: async inp => await Controller.LoadData(inp.itemsName)
                    },
                    {
                      name: "search",
                      proc: async inp => await Controller.SearchData(inp.BUid, inp.itemsName, inp.field, inp.pattern, inp.query, inp.useQuery, inp.isRegex, inp.caseIns)
                    },
                    {
                      name: "view",
                      proc: async inp => await Utility.Utility.ReadStorage("view", inp.BUid, inp.itemsName)
                    },
                    {
                      name: "import-de",
                      proc: async inp => await Controller.ImportDEData(inp)
                    }
                   ];

  static async Process(inp) {
    const action = Controller.actions.find(entry => entry.name === inp.actionName);
    if(!action) return;

    return await action.proc(inp);
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
        if(storage.data[i][itemsName]) storage.data[i][itemsName].Items.forEach(entry => items.push(entry));
      }
    }
    else if(storage.i > -1 && storage.data[storage.i][itemsName]) storage.data[storage.i][itemsName].Items.forEach(entry => items.push(entry));

    return items;
  }

  static async ImportData(data) {
    await Utility.Utility.ImportStorage(data);
  }

  static async SearchDataByQuery(query, isRegex, caseIns) {
    const parsed = new QueryParser.QueryParser(query).Parse(isRegex, caseIns);
    const item = Controller.items.find(entry => entry.itemsName.toLowerCase() === parsed.from.toLowerCase());
    if(!item) return [];

    const items = await Controller.ReadData(null, item.itemsName);
    if(items.length === 0) return [];

    const fields = ["Type"];
    if(!parsed.fields.includes("*")) {
      for(const parsedField of parsed.fields) {
        const itemField = Utility.Utility.FindCaseIns(item.tableFields, parsedField);
        if(itemField) fields.push(itemField);
      }
      if(fields.length === 1) return [];
    }

    const filtered = parsed.where ? items.filter(entry => QueryParser.QueryParser.CheckWhere(entry, parsed.where, item.check)) : items;
    if(!parsed.fields.includes("*")) {
      for(const item of filtered) {
        for(const field of Object.keys(item)) {
          if(!fields.includes(field)) delete item[field];
        }
      }
    }

    return filtered;
  }

  static async SearchDataByInput(BUid, itemsName, field, pattern, isRegex, caseIns) {
    const items = await Controller.ReadData(BUid, itemsName);
    if(items.length === 0) return [];

    const item = Controller.items.find(entry => entry.type === items[0].Type);
    if(!item) return [];

    if(!isRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = caseIns ? new RegExp(pattern, "i") : new RegExp(pattern);

    return items.filter(entry => item.check(entry, field, regex));
  }

  static async SearchData(BUid, itemsName, field, pattern, query, useQuery, isRegex, caseIns) {
    if(useQuery) return await Controller.SearchDataByQuery(query, isRegex, caseIns);
    return await Controller.SearchDataByInput(BUid, itemsName, field, pattern, isRegex, caseIns);
  }

  static async ImportDEData(inp) {
    const stack = await Utility.Utility.GetStack();
    await DEImporter.DEImporter.Import(stack, inp.DEname, inp.data, inp.sep, inp.chunkSize, inp.method);
  }

}