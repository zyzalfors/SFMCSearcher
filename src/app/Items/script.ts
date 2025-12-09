import { Utility } from "../Logics/utility";

export class Script {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Description", "Path", "Link", "Code", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "CreatedBy", "CreatedDate", "Description", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Path"];
  public static readonly itemsName: string = "Scripts";
  public static readonly type: string = "Script";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Script.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/?$page=${page}&$pagesize=${Script.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/${pageItem.ssjsActivityId}`);

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CategoryId: pageItem.categoryId,
          Code: Utility.SanitizeXml(pageItem.script),
          CreatedBy: _item?.createdBy,
          CreatedDate: pageItem.createdDate,
          Description: pageItem.description,
          Id: pageItem.ssjsActivityId,
          Key: pageItem.key,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/423/${pageItem.ssjsActivityId}`,
          ModifiedBy: _item?.modifiedBy,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Path: Utility.GetFullPath(pageItem.categoryId, folders),
          Type: Script.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Script.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    return (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20ssjsactivity`)).items;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Script.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}