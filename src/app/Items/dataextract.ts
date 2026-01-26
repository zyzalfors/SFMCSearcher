import { Utility } from "../Logics/utility";

export class DataExtract {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Link", "Pattern", "Subtype", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedBy", "CreatedDate", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Pattern", "Subtype"];
  public static readonly itemsName: string = "DataExtracts";
  public static readonly type: string = "DataExtract";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const extTypes: any[] = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracttypes`);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts?$page=${page}&$pagesize=${DataExtract.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/dataextracts/${pageItem.dataExtractDefinitionId}`);
        const extType: any = extTypes.find((entry: any) => entry.extractId === _item?.dataExtractTypeId);

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CreatedBy: _item?.createdBy,
          CreatedDate: pageItem.createdDate,
          Fields: _item?.dataFields,
          Id: _item?.dataExtractDefinitionId,
          Key: _item?.key,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/73/${_item?.dataExtractDefinitionId}`,
          ModifiedBy: _item?.modifiedBy,
          ModifiedDate: pageItem.modifiedDate,
          Name: _item?.name,
          Pattern: _item?.fileSpec,
          Subtype: extType?.name,
          Type: DataExtract.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, DataExtract.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(DataExtract.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}