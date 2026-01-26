import { Utility } from "../Logics/utility";

export class Import {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link1", "Link2", "Pattern", "SourceDE", "TargetDE", "AlertEmail", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AlertEmail", "BUId", "BUName", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Pattern", "SourceDE", "TargetDE"];
  public static readonly itemsName: string = "Imports";
  public static readonly type: string = "Import";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/?$page=${page}&$pagesize=${Import.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/${pageItem.importDefinitionId}`);

        const item: any = {
          AlertEmail: _item?.notificationEmailAddress,
          BUId: BUid,
          BUName: BUname,
          CreatedDate: _item?.createdDate,
          Id: _item?.importDefinitionId,
          Key: _item?.customerKey,
          Link1: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/43/${_item?.importDefinitionId}`,
          Link2: `https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html#admin/import-definition/${_item?.importDefinitionId}/properties`,
          ModifiedDate: _item?.modifiedDate,
          Name: _item?.name,
          Pattern: _item?.fileNamingPattern,
          SourceDE: _item?.sourceDataExtensionName,
          TargetDE: _item?.destinationName,
          Type: Import.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Import.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Import.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}