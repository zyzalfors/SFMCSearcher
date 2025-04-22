import * as Utility from "/Logics/utility.js";

export class FileTransfer {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Destination", "CreatedDate", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "CreatedDate", "Destination", "Id", "Key", "ModifiedDate", "Name", "Pattern"];
  static itemsName = "FileTransfers";
  static type = "FileTransfer";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CreatedDate: item.createdDate,
                Destination: item._destination,
                Id: item.id,
                Key: item.customerKey,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/53/${item.id}`,
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

    let page = 1, pageItems = [0];
    const ftpLocations = (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/ftpLocations`)).items;

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers/${pageItem.id}`);
        const ftpLocation = ftpLocations.find(entry => entry.id === item.fileTransferLocationId);
        item._destination = ftpLocation?.relPath || ftpLocation?.name;

        items.push(FileTransfer.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, FileTransfer.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(FileTransfer.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}