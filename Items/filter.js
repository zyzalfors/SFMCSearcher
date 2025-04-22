import * as Utility from "/Logics/utility.js";

export class Filter {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "FilterDefinitionId", "FilterDefinitionName", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "CreatedByName", "CreatedDate", "FilterDefinitionId", "FilterDefinitionName", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path"];
  static itemsName = "Filters";
  static type = "Filter";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item._createdByName,
                CreatedDate: item.createdDate,
                FilterDefinitionId: item.filterDefinitionId,
                FilterDefinitionName: item._filterDefinitionName,
                Id: item.filterActivityId,
                Key: item.customerKey,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/#ActivityModal/303/${item.filterActivityId}`,
                ModifiedByName: item._modifiedByName,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Filter.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;

    let page = 1, pageItems = [0];
    const folders = await Filter.GetFolders(stack);

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filters/?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const filterDefinition  = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filterdefinitions/${pageItem.filterDefinitionId}`);

        pageItem._filterDefinitionName = filterDefinition?.name;
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
        pageItem._createdByName = filterDefinition?.createdByName;
        pageItem._modifiedByName = filterDefinition?.modifiedByName;

        items.push(Filter.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, Filter.itemsName, items);
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20filteractivity`)).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Filter.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}