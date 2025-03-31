import * as Utility from "../Logics/utility.js";

export class Filter {

  static tableFields = ["BUId", "BUName", "CategoryId", "CreatedDate", "FilterDefinitionId", "FilterDefinitionName", "Id", "Key", "ModifiedDate", "Name", "Path"];
  static searchFields = ["CategoryId", "CreatedDate", "FilterDefinitionId", "FilterDefinitionName", "Id", "Key", "ModifiedDate", "Name", "Path"];
  static itemsName = "Filters";
  static type = "filter";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedDate: item.createdDate,
                FilterDefinitionId: item.filterDefinitionId,
                FilterDefinitionName: item._filterDefinitionName,
                Id: item.filterActivityId,
                Key: item.customerKey,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Filter.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const folders = await Filter.GetFolders(stack);
    const pageSize = 500;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filters/?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        const filterDefinition  = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filterdefinitions/" + pageItem.filterDefinitionId);
        pageItem._filterDefinitionName = filterDefinition?.name;
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
        data.push(Filter.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Filter.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20filteractivity")).items;
  }

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}