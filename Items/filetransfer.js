import * as Utility from "../Logics/utility.js";

export class FileTransfer {

  static tableFields = ["BUId", "BUName", "CreatedDate", "Destination", "Id", "Key", "ModifiedDate", "Name", "Pattern"];
  static searchFields = ["CreatedDate", "Destination", "Id", "Key", "ModifiedDate", "Name", "Pattern"];
  static itemsName = "FileTransfers";
  static type = "filetransfer";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CreatedDate: item.createdDate,
                Destination: item._destination,
                Id: item.id,
                Key: item.customerKey,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Pattern: item.fileSpec,
                Type: FileTransfer.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    const ftpLocations = (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/ftpLocations")).items;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers/" + pageItem.id);
        const ftpLocation = ftpLocations.find(entry => entry.id === item.fileTransferLocationId);
        item._destination = ftpLocation?.relPath;
        data.push(FileTransfer.Build(item, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, FileTransfer.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(FileTransfer.searchFields, field);
    if(!field) return;
    return regex.test(item[field]);
  }

}