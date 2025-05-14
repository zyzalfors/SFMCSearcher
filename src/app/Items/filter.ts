import { Utility } from "../Logics/utility";

export class Filter {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "FilterDefinitionId", "FilterDefinitionName", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "FilterDefinitionId", "FilterDefinitionName", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path"];
  public static readonly itemsName: string = "Filters";
  public static readonly type: string = "Filter";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item._createdByName,
                CreatedDate: item.createdDate,
                FilterDefinitionId: item.filterDefinitionId,
                FilterDefinitionName: item._filterDefinitionName,
                Id: item.filterActivityId,
                Key: item.customerKey,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/#ActivityModal/303/${item.filterActivityId}`,
                ModifiedByName: item._modifiedByName,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Filter.type
    });
  }

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

        pageItem._filterDefinitionName = filterDefinition?.name;
        pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);
        pageItem._createdByName = filterDefinition?.createdByName;
        pageItem._modifiedByName = filterDefinition?.modifiedByName;

        items.push(Filter.Build(pageItem, stack, BUid, BUname));
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
    const itemField: string | undefined = Utility.FindCaseIns(Filter.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}