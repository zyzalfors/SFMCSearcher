import * as Utility from "../Logics/utility.js";

export class Script {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Code", "CreatedDate", "ModifiedDate"];
  static searchFields = ["Code", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Path"];
  static itemsName = "Scripts";
  static type = "script";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.Utility.SanitizeXml(item.script),
                CreatedDate: item.createdDate,
                Id: item.ssjsActivityId,
                Key: item.key,
                Link: "https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/423/" + item.ssjsActivityId,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Script.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const folders = await Script.GetFolders(stack);
    const pageSize = 500;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
        data.push(Script.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Script.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20ssjsactivity")).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Script.searchFields, field);
    if(!field) return;
    return regex.test(item[field]);
  }

}