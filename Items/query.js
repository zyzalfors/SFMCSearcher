import * as Utility from "../Logics/utility.js";

export class Query {

  static tableFields = ["BUId", "BUName", "CategoryId", "Code", "CreatedDate", "Id", "Key", "Link", "ModifiedDate", "Name", "Path", "TargetDE", "UpdateType"];
  static searchFields = ["CategoryId", "Code", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Path", "TargetDE", "UpdateType"];
  static itemsName = "Queries";
  static type = "query";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.Utility.SanitizeXml(item.queryText),
                CreatedDate: item.createdDate,
                Id: item.queryDefinitionId,
                Key: item.key,
                Link: "https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/300/" + item.queryDefinitionId,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                TargetDE: item.targetName,
                Type: Query.type,
                UpdateType: item.targetUpdateTypeName
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const folders = await Query.GetFolders(stack);
    const pageSize = 500;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/queries/?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
        data.push(Query.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Query.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20queryactivity")).items;
  }

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}