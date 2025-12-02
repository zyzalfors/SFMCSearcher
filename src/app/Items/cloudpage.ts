import { Utility } from "../Logics/utility";

export class Cloudpage {

  public static readonly tableFields: string[] = ["BUId", "BUName", "AssetId", "ContentId", "PageId", "Name", "Path", "Status", "Url", "Code", "Subtype", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AssetId", "BUId", "BUName", "Code", "ContentId", "CreatedDate", "ModifiedDate", "Name", "PageId", "Path", "Status", "Subtype", "Url"];
  public static readonly itemsName: string = "Cloudpages";
  public static readonly type: string = "Cloudpage";
  private static readonly pageSize: number = 500;
  private static readonly subTypes: string[] = ["landing-pages", "code-resources", "microsites", "smartcapture-forms"];

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Cloudpage.GetFolders(stack);

    const items1: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://cloud-pages.s${stack}.marketingcloudapps.com/fuelapi/internal/v2/cloudpages/contents?$page=${page}&$pagesize=${Cloudpage.pageSize}`);
      pageItems = pageData.entities;
      pageItems.forEach((entry: any) => items1.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    const items2: any[] = [];
    for(const subType of Cloudpage.subTypes) {
      page = 1;
      pageItems = [0];

      while(pageItems.length > 0) {
        const pageData: any = await Utility.FetchJSON(`https://cloud-pages.s${stack}.marketingcloudapps.com/fuelapi/internal/v2/cloudpages/${subType}?$page=${page}&$pagesize=${Cloudpage.pageSize}`);
        pageItems = pageData.entities;

        for(const pageItem of pageItems) {
          pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);
          pageItem._subtype = subType;
        }
        pageItems.forEach((entry: any) => items2.push(entry));

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    const items: any[] = [];
    for(const item2 of items2) {
      const item1: any = items1.find((entry: any) => entry.pageId === item2.pageId || entry.contentId === item2.contentId);

      const item: any = {
        AssetId: item2.siteAssetId,
        BUId: BUid,
        BUName: BUname,
        CategoryId: item2.categoryId,
        Code: Utility.SanitizeXml(item1?.html),
        ContentId: item2.contentId,
        CreatedDate: item2.createdDate,
        ModifiedDate: item2.modifiedDate,
        Name: item2.name,
        PageId: item2.pageId,
        Path: item2._path,
        Status: item2.status,
        Subtype: item2._subtype,
        Type: Cloudpage.type,
        Url: item2.url
      };

      items.push(Utility.SanitizeObj(item));
    }

    await Utility.StoreData(BUid, BUname, Cloudpage.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = [];

    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://content-builder.s${stack}.marketingcloudapps.com/fuelapi/asset/v1/content/categories?categoryType=cloudpages&$page=${page}&$pagesize=${Cloudpage.pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach((entry: any) => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Cloudpage.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}