import { Utility } from "../Logics/utility";

export class Query {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Description", "Path", "Link", "TargetDEId", "TargetDEKey", "TargetDE", "TargetDEDescription", "UpdateType", "Code", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "CreatedDate", "Description", "Id", "Key", "ModifiedDate", "Name", "Path", "TargetDEDescription", "TargetDEId", "TargetDEKey", "TargetDE", "UpdateType"];
  public static readonly itemsName: string = "Queries";
  public static readonly type: string = "Query";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Query.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/queries/?$page=${page}&$pagesize=${Query.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CategoryId: pageItem.categoryId,
          Code: Utility.SanitizeXml(pageItem.queryText),
          CreatedDate: pageItem.createdDate,
          Description: pageItem.description,
          Id: pageItem.queryDefinitionId,
          Key: pageItem.key,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityDetails/300/${pageItem.queryDefinitionId}`,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Path: Utility.GetFullPath(pageItem.categoryId, folders),
          TargetDEDescription: pageItem.targetDescription,
          TargetDEId: pageItem.targetId,
          TargetDEKey: pageItem.targetKey,
          TargetDE: pageItem.targetName,
          Type: Query.type,
          UpdateType: pageItem.targetUpdateTypeName
        };

        items.push(Utility.SanitizeObj(item));
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
    const searchField: string | undefined = Utility.FindCaseIns(Query.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}