import { Utility } from "../Logics/utility";

export class Import {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link1", "Link2", "Pattern", "SourceDE", "TargetDE", "AlertEmail", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AlertEmail", "BUId", "BUName", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Pattern", "SourceDE", "TargetDE"];
  public static readonly itemsName: string = "Imports";
  public static readonly type: string = "Import";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    Utility.SanitizeObj({
                AlertEmail: item.notificationEmailAddress,
                BUId: BUid,
                BUName: BUname,
                CreatedDate: item.createdDate,
                Id: item.importDefinitionId,
                Key: item.customerKey,
                Link1: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/43/${item.importDefinitionId}`,
                Link2: `https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html#admin/import-definition/${item.importDefinitionId}/properties`,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Pattern: item.fileNamingPattern,
                SourceDE: item.sourceDataExtensionName,
                TargetDE: item.destinationName,
                Type: Import.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/?$page=${page}&$pagesize=${Import.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/imports/${pageItem.importDefinitionId}`);
        items.push(Import.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Import.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Import.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}