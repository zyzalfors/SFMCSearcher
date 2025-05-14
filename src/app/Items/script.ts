import { Utility } from "../Logics/utility";

export class Script {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Code", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "CreatedBy", "CreatedDate", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name", "Path"];
  public static readonly itemsName: string = "Scripts";
  public static readonly type: string = "Script";
  private static readonly pageSize: number = 500;

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.SanitizeXml(item.script),
                CreatedBy: item._createdBy,
                CreatedDate: item.createdDate,
                Id: item.ssjsActivityId,
                Key: item.key,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/?hub=1#ActivityModal/423/${item.ssjsActivityId}`,
                ModifiedBy: item._modifiedBy,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Type: Script.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Script.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/?$page=${page}&$pagesize=${Script.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);

        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/scripts/${pageItem.ssjsActivityId}`);
        pageItem._createdBy = item?.createdBy;
        pageItem._modifiedBy = item?.modifiedBy;

        items.push(Script.Build(pageItem, stack, BUid, BUname));
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
    const itemField: string | undefined = Utility.FindCaseIns(Script.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}