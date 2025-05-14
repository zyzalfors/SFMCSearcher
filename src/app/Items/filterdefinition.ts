import { Utility } from "../Logics/utility";

export class FilterDefinition {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "SourceDE", "Xml", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "SourceDE", "Xml"];
  public static readonly itemsName: string = "FilterDefinitions";
  public static readonly type: string = "FilterDefinition";
  private static readonly pageSize: number = 500;

  private static Build(item: any, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item.createdByName,
                CreatedDate: item.createdDate,
                Id: item.id,
                Key: item.key,
                ModifiedByName: item.lastUpdatedByName,
                ModifiedDate: item.lastUpdated,
                Name: item.name,
                Path: item._path,
                SourceDE: item.derivedFromObjectName,
                Type: FilterDefinition.type,
                Xml: Utility.SanitizeXml(item.filterDefinitionXml)
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    const folders: any[] = await FilterDefinition.GetFolders(stack);

    const items: any[] = [];
    for(const folder of folders) {
       let page: number = 1;
       let pageItems: any[] = [0];

      while(pageItems.length > 0) {
        const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/email/v1/filters/filterdefinition/category/${folder.categoryId}?$page=${page}&$pagesize=${FilterDefinition.pageSize}`);
        pageItems = pageData.items;

        for(const pageItem of pageItems) {
          pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);
          items.push(FilterDefinition.Build(pageItem, BUid, BUname));
        }

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    await Utility.StoreData(BUid, BUname, FilterDefinition.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    return (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20filterdefinition`)).items;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(FilterDefinition.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}