import { Utility } from "../Logics/utility";

export class FileTransfer {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Destination", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedDate", "Destination", "Id", "Key", "ModifiedDate", "Name", "Pattern"];
  public static readonly itemsName: string = "FileTransfers";
  public static readonly type: string = "FileTransfer";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const ftpLocations: any[] = (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/ftpLocations`)).items;

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers?$page=${page}&$pagesize=${FileTransfer.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers/${pageItem.id}`);
        const ftpLocation: any = ftpLocations.find((entry: any) => entry.id === _item?.fileTransferLocationId);

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CreatedDate: _item?.createdDate,
          Destination: ftpLocation?.relPath || ftpLocation?.name,
          Id: _item?.id,
          Key: _item?.customerKey,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/53/${_item?.id}`,
          ModifiedDate: _item?.modifiedDate,
          Name: _item?.name,
          Pattern: _item?.fileSpec,
          Type: FileTransfer.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, FileTransfer.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(FileTransfer.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}