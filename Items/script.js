import * as Utility from "/Logics/utility.js";

export class Script {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Code", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "Code", "CreatedBy", "CreatedDate", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Path"];
  static itemsName = "Scripts";
  static type = "Script";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.Utility.SanitizeXml(item.script),
                CreatedBy: item._createdBy,
                CreatedDate: item.createdDate,
                Id: item.ssjsActivityId,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/423/${item.ssjsActivityId}`,
                ModifiedBy: item._modifiedBy,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Script.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;

    let page = 1, pageItems = [0];
    const folders = await Script.GetFolders(stack);

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);

        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/${pageItem.ssjsActivityId}`);
        pageItem._createdBy = item?.createdBy;
        pageItem._modifiedBy = item?.modifiedBy;

        items.push(Script.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, Script.itemsName, items);
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20ssjsactivity`)).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Script.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}