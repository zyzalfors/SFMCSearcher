import { Utility } from "../Logics/utility";

export class DataExtension {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Description", "Link", "RowCount", "Sendable", "SendableKey", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "Description", "Id", "Key",  "ModifiedByName", "ModifiedDate", "Name", "Path", "RowCount", "Sendable", "SendableKey", "Subtype"];
  public static readonly itemsName: string = "DataExtensions";
  public static readonly type: string = "DataExtension";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
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
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    const folders: any[] = await DataExtension.GetFolders(stack);

    const items: any[] = [];
    for(const folder of folders) {
      let page: number = 1;
      let pageItems: any[] = [0];

      while(pageItems.length > 0) {
        const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/data-internal/v1/customobjects/category/${folder.id}?retrievalType=1&$page=${page}&$pagesize=${DataExtension.pageSize}`);
        pageItems = pageData.items;

        for(const pageItem of pageItems) {
          pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);
          items.push(DataExtension.Build(pageItem, stack, BUid, BUname));
        }

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    await Utility.StoreData(BUid, BUname, DataExtension.itemsName, items);
  }

  private static async GetAllFolders(stack: string, categoryFilter: string, categoryId: number, folders: any[]): Promise<void> {
    const pageItems: any[] = (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/legacy/v1/beta/folder/${categoryId}/children?$where=allowedtypes%20in%20${categoryFilter}`)).entry;

    for(const pageItem of pageItems) {
      folders.push(pageItem);
      await DataExtension.GetAllFolders(stack, categoryFilter, pageItem.id, folders);
    }
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    const categoryTypes: string[] = ["dataextension", "salesforcedataextension", "synchronizeddataextension", "shared_data", "shared_dataextension", "shared_salesforcedataextension"];
    const categoryFilter: string = `(%27${categoryTypes.join("%27,%27")}%27)`;

    const folders: any[] = [];
    await DataExtension.GetAllFolders(stack, categoryFilter, 0, folders);

    return folders;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(DataExtension.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}