import * as Utility from "../Logics/utility.js";

export class Import {

  static tableFields = ["AlertEmail", "BUId", "BUName", "CreatedDate", "Id", "Key", "Link1", "Link2", "ModifiedDate", "Name", "Pattern", "SourceDE", "TargetDE"];
  static searchFields = ["AlertEmail", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Pattern", "SourceDE", "TargetDE"];
  static itemsName = "Imports";
  static type = "import";

  static Build(item, stack, BUid, BUname) {
    const o = {
                AlertEmail: item.notificationEmailAddress,
                BUId: BUid,
                BUName: BUname,
                CreatedDate: item.createdDate,
                Id: item.importDefinitionId,
                Key: item.customerKey,
                Link1: "https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/43/" + item.importDefinitionId,
                Link2: "https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/admin.html#admin/import-definition/" + item.importDefinitionId + "/properties",
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Pattern: item.fileNamingPattern,
                SourceDE: item.sourceDataExtensionName,
                TargetDE: item.destinationName,
                Type: Import.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/" + pageItem.importDefinitionId);
        data.push(Import.Build(item, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Import.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Import.searchFields, field);
    if(!field) return;
    return regex.test(item[field]);
  }

}