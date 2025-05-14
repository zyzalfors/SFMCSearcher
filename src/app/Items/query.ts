import { Utility } from "../Logics/utility";

export class Query {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "TargetDE", "UpdateType", "Code", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "CreatedDate", "Id", "Key", "ModifiedDate", "Name", "Path", "TargetDE", "UpdateType"];
  public static readonly itemsName: string = "Queries";
  public static readonly type: string = "Query";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.SanitizeXml(item.queryText),
                CreatedDate: item.createdDate,
                Id: item.queryDefinitionId,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/300/${item.queryDefinitionId}`,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                TargetDE: item.targetName,
                Type: Query.type,
                UpdateType: item.targetUpdateTypeName
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Query.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/queries/?$page=${page}&$pagesize=${Query.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);
        items.push(Query.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Query.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    return (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20queryactivity`)).items;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Query.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}