import * as Utility from "/Logics/utility.js";

export class DataExtension {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Description", "Link", "RowCount", "Sendable", "SendableKey", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "CreatedByName", "CreatedDate", "Description", "Id", "Key",  "ModifiedByName", "ModifiedDate", "Name", "Path", "RowCount", "Sendable", "SendableKey", "Subtype"];
  static itemsName = "DataExtensions";
  static type = "DataExtension";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item.createdByName,
                CreatedDate: item.createdDate,
                Description: item.description,
                Id: item.id,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html#admin/data-extension/${item.id}/properties/`,
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
    const pageSize = 500;
    const folders = await DataExtension.GetFolders(stack);

    const items = [];
    for(const folder of folders) {
      let page = 1, pageItems = [0];

      while(pageItems.length > 0) {
        const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/data-internal/v1/customobjects/category/${folder.id}?retrievalType=1&$page=${page}&$pagesize=${pageSize}`);
        pageItems = pageData.items;

        for(const pageItem of pageItems) {
          pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
          items.push(DataExtension.Build(pageItem, stack, BUid, BUname));
        }

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }
    await Utility.Utility.SetStorage(BUid, BUname, DataExtension.itemsName, items);
  }

  static async GetAllFolders(stack, categoryFilter, categoryId, folders) {
    const pageItems = (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/legacy/v1/beta/folder/${categoryId}/children?$where=allowedtypes%20in%20${categoryFilter}`)).entry;

    for(const pageItem of pageItems) {
      folders.push(pageItem);
      await DataExtension.GetAllFolders(stack, categoryFilter, pageItem.id, folders);
    }
  }

  static async GetFolders(stack) {
    const categoryTypes = ["dataextension", "salesforcedataextension", "synchronizeddataextension", "shared_data", "shared_dataextension", "shared_salesforcedataextension"];
    const categoryFilter = `(%27${categoryTypes.join("%27,%27")}%27)`;

    const folders = [];
    await DataExtension.GetAllFolders(stack, categoryFilter, 0, folders);

    return folders;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(DataExtension.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}