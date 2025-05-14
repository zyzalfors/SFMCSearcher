import { Utility } from "../Logics/utility";

export class FileTransfer {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Destination", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedDate", "Destination", "Id", "Key", "ModifiedDate", "Name", "Pattern"];
  public static readonly itemsName: string = "FileTransfers";
  public static readonly type: string = "FileTransfer";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
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
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const ftpLocations: any[] = (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/ftpLocations`)).items;

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers?$page=${page}&$pagesize=${FileTransfer.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filetransfers/${pageItem.id}`);
        const ftpLocation: any = ftpLocations.find((entry: any) => entry.id === item.fileTransferLocationId);
        item._destination = ftpLocation?.relPath || ftpLocation?.name;
        items.push(FileTransfer.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, FileTransfer.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(FileTransfer.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}