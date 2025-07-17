import { Utility } from "../Logics/utility";

export class DataExtension {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Description", "Link", "RowCount", "Sendable", "SendableKey", "Subtype", "RetentionPeriod", "DeleteData", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "DeleteData", "Description", "Id", "Key",  "ModifiedByName", "ModifiedDate", "Name", "Path", "RetentionPeriod", "RowCount", "Sendable", "SendableKey", "Subtype"];
  public static readonly itemsName: string = "DataExtensions";
  public static readonly type: string = "DataExtension";
  private static readonly pageSize: number = 500;
  private static readonly retPeriodUnits = new Map<number, string>([[3, "Days"], [4, "Weeks"], [5, "Months"], [6, "Years"]]);

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item.createdByName,
                CreatedDate: item.createdDate,
                DeleteData: item._deleteData,
                Description: item.description,
                Id: item.id,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html#admin/data-extension/${item.id}/properties/`,
                ModifiedByName: item.modifiedByName,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                RetentionPeriod: item._retentionPeriod,
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

          const retPeriodLength: any = pageItem.dataRetentionProperties?.dataRetentionPeriodLength;
          const retPeriodUnit: any = DataExtension.retPeriodUnits.get(pageItem.dataRetentionProperties?.dataRetentionPeriodUnitOfMeasure);
          const resetPeriodOnImport: any = pageItem.dataRetentionProperties?.isResetRetentionPeriodOnImport;
          const retainUntil: any = pageItem.dataRetentionProperties?.retainUntil;

          if(retPeriodLength && retPeriodUnit) {
            const resetPart: string = resetPeriodOnImport ? ", reset period on import" : "";
            pageItem._retentionPeriod = `${retPeriodLength} ${retPeriodUnit}${resetPart}`;
          }
          else if(retainUntil) pageItem._retentionPeriod = `On ${retainUntil}`;
          else pageItem._retentionPeriod = null;

          if(!pageItem._retentionPeriod) pageItem._deleteData = null;
          else if(pageItem.dataRetentionProperties?.isRowBasedRetention) pageItem._deleteData = "Individual records";
          else if(pageItem.dataRetentionProperties?.isDeleteAtEndOfRetentionPeriod) pageItem._deleteData = "All records";
          else pageItem._deleteData = "All records and data extension";

          items.push(DataExtension.Build(pageItem, stack, BUid, BUname));
        }

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    await Utility.StoreData(BUid, BUname, DataExtension.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    const categoryTypes: string[] = ["dataextension", "salesforcedataextension", "synchronizeddataextension", "shared_data", "shared_dataextension", "shared_salesforcedataextension"];
    const categoryFilter: string = `(%27${categoryTypes.join("%27,%27")}%27)`;

    const folders: any[] = [];
    const categoryIds: number[] = [0];

    while(categoryIds.length > 0) {
      const categoryId: number | undefined = categoryIds.pop();
      const pageItems: any[] = (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/legacy/v1/beta/folder/${categoryId}/children?$where=allowedtypes%20in%20${categoryFilter}`)).entry;

      for(const pageItem of pageItems) {
        folders.push(pageItem);
        categoryIds.push(pageItem.id);
      }
    }

    return folders;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(DataExtension.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}