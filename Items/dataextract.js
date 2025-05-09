import * as Utility from "/Logics/utility.js";

export class DataExtract {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Subtype", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "CreatedBy", "CreatedDate", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Pattern", "Subtype"];
  static itemsName = "DataExtracts";
  static type = "DataExtract";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CreatedBy: item.createdBy,
                CreatedDate: item._createdDate,
                Fields: item.dataFields,
                Id: item.dataExtractDefinitionId,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/73/${item.dataExtractDefinitionId}`,
                ModifiedBy: item.modifiedBy,
                ModifiedDate: item._modifiedDate,
                Name: item.name,
                Pattern: item.fileSpec,
                Subtype: item._subtype,
                Type: DataExtract.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;

    let page = 1, pageItems = [0];
    const extTypes = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracttypes`);

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts/${pageItem.dataExtractDefinitionId}`);
        item._createdDate = pageItem.createdDate;
        item._modifiedDate = pageItem.modifiedDate;
        const extType = extTypes.find(entry => entry.extractId === item.dataExtractTypeId);
        item._subtype = extType?.name;

        items.push(DataExtract.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, DataExtract.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(DataExtract.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}