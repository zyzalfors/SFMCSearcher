import { Utility } from "../Logics/utility";

export class Filter {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "FilterDefinitionId", "FilterDefinitionName", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "FilterDefinitionId", "FilterDefinitionName", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path"];
  public static readonly itemsName: string = "Filters";
  public static readonly type: string = "Filter";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Filter.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filters/?$page=${page}&$pagesize=${Filter.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const filterDefinition: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/filterdefinitions/${pageItem.filterDefinitionId}`);

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CategoryId: pageItem.categoryId,
          CreatedByName: filterDefinition?.createdByName,
          CreatedDate: pageItem.createdDate,
          FilterDefinitionId: pageItem.filterDefinitionId,
          FilterDefinitionName: filterDefinition?.name,
          Id: pageItem.filterActivityId,
          Key: pageItem.customerKey,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/#ActivityModal/303/${pageItem.filterActivityId}`,
          ModifiedByName: filterDefinition?.modifiedByName,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Path: Utility.GetFullPath(pageItem.categoryId, folders),
          Type: Filter.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Filter.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    return (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20filteractivity`)).items;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Filter.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}