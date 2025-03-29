import * as Utility from "../Logics/utility.js";

export class DataExtension {

  static tableFields = ["BUId", "BUName", "CategoryId", "CreatedByName", "CreatedDate", "Id", "Key", "Link", "ModifiedByName", "ModifiedDate", "Name", "Path", "RowCount", "Sendable", "SendableKey", "Subtype"];
  static searchFields = ["CategoryId", "CreatedByName", "CreatedDate", "Id", "Key",  "ModifiedByName", "ModifiedDate", "Name", "Path", "RowCount", "Sendable", "SendableKey", "Subtype"];
  static itemsName = "DataExtensions";
  static type = "dataextension";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item.createdByName,
                CreatedDate: item.createdDate,
                Id: item.id,
                Key: item.key,
                Link: "https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/admin.html#admin/data-extension/" + item.id + "/properties/",
                ModifiedByName: item.modifiedByName,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                RowCount: item.rowCount,
                Sendable: item.isSendable,
                SendableKey: item.sendableCustomObjectField,
                Subtype: item.partnerApiObjectTypeName,
                Type: DataExtension.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const categoryTypes = ["dataextension", "salesforcedataextension", "synchronizeddataextension", "shared_data", "shared_dataextension", "shared_salesforcedataextension"];
    const folders = await Utility.Utility.GetFolders(stack, categoryTypes);
    const pageSize = 500;
    for(const folder of folders) {
      let page = 1, pageItems = [0];
      while(pageItems.length > 0) {
        const data = [];
        const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/fuelapi/data-internal/v1/customobjects/category/" + folder.id + "?retrievalType=1&$page=" + page + "&$pagesize=" + pageSize);
        pageItems = pageData.items;
        for(const pageItem of pageItems) {
          pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
          data.push(DataExtension.Build(pageItem, stack, BUid, BUname));
        }
        await Utility.Utility.SetStorage(BUid, BUname, DataExtension.itemsName, data);
        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }
  }

  /*static async GetFields(stack, DEid) {
    const fields = [];
    const fieldsData = (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/" + DEid + "/fields")).fields;
    for(const entry of fieldsData) fields.push(entry.name);
    return fields.join(",");
  }*/

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}
