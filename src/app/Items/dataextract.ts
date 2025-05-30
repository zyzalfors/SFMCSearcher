import { Utility } from "../Logics/utility";

export class DataExtract {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Subtype", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedBy", "CreatedDate", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Pattern", "Subtype"];
  public static readonly itemsName: string = "DataExtracts";
  public static readonly type: string = "DataExtract";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CreatedBy: item.createdBy,
                CreatedDate: item._createdDate,
                Fields: item.dataFields,
                Id: item.dataExtractDefinitionId,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/73/${item.dataExtractDefinitionId}`,
                ModifiedBy: item.modifiedBy,
                ModifiedDate: item._modifiedDate,
                Name: item.name,
                Pattern: item.fileSpec,
                Subtype: item._subtype,
                Type: DataExtract.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const extTypes: any[] = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracttypes`);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts?$page=${page}&$pagesize=${DataExtract.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts/${pageItem.dataExtractDefinitionId}`);
        item._createdDate = pageItem.createdDate;
        item._modifiedDate = pageItem.modifiedDate;

        const extType: any = extTypes.find((entry: any) => entry.extractId === item.dataExtractTypeId);
        item._subtype = extType?.name;
        items.push(DataExtract.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, DataExtract.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(DataExtract.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}
