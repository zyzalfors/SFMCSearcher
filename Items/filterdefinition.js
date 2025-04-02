import * as Utility from "../Logics/utility.js";

export class FilterDefinition {

  static tableFields = ["BUId", "BUName", "CategoryId", "CreatedByName", "CreatedDate", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "SourceDE", "Xml"];
  static searchFields = ["CategoryId", "CreatedByName", "CreatedDate", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "SourceDE", "Xml"];
  static itemsName = "FilterDefinitions";
  static type = "filterdefinition";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item.createdByName,
                CreatedDate: item.createdDate,
                Id: item.id,
                Key: item.key,
                ModifiedByName: item.lastUpdatedByName,
                ModifiedDate: item.lastUpdated,
                Name: item.name,
                Path: item._path,
                SourceDE: item.derivedFromObjectName,
                Type: FilterDefinition.type,
                Xml: Utility.Utility.SanitizeXml(item.filterDefinitionXml)
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const folders = await FilterDefinition.GetFolders(stack);
    const pageSize = 500;
    for(const folder of folders) {
      let page = 1, pageItems = [0];
      while(pageItems.length > 0) {
        const data = [];
        const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/email/v1/filters/filterdefinition/category/" + folder.categoryId + "?$page=" + page + "&$pagesize=" + pageSize);
        pageItems = pageData.items;
        for(const pageItem of pageItems) {
          pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
          data.push(FilterDefinition.Build(pageItem, stack, BUid, BUname));
        }
        await Utility.Utility.SetStorage(BUid, BUname, FilterDefinition.itemsName, data);
        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20filterdefinition")).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(FilterDefinition.searchFields, field);
    if(!field) return;
    return regex.test(item[field]);
  }

}