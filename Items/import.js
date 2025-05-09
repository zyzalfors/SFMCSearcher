import * as Utility from "/Logics/utility.js";

export class Import {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Link1", "Link2", "Pattern", "SourceDE", "TargetDE", "AlertEmail", "CreatedDate", "ModifiedDate"];
  static searchFields = ["AlertEmail", "BUId", "BUName", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Pattern", "SourceDE", "TargetDE"];
  static itemsName = "Imports";
  static type = "Import";

  static Build(item, stack, BUid, BUname) {
    const o = {
                AlertEmail: item.notificationEmailAddress,
                BUId: BUid,
                BUName: BUname,
                CreatedDate: item.createdDate,
                Id: item.importDefinitionId,
                Key: item.customerKey,
                Link1: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/43/${item.importDefinitionId}`,
                Link2: `https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html#admin/import-definition/${item.importDefinitionId}/properties`,
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

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/${pageItem.importDefinitionId}`);
        items.push(Import.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, Import.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Import.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}