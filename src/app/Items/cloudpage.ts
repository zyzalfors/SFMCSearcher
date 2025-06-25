import { Utility } from "../Logics/utility";

export class Cloudpage {

  public static readonly tableFields: string[] = ["BUId", "BUName", "AssetId", "ContentId", "PageId", "Name", "Path", "Status", "Url", "Code", "Subtype", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AssetId", "BUId", "BUName", "Code", "ContentId", "CreatedDate", "ModifiedDate", "Name", "PageId", "Path", "Status", "Subtype", "Url"];
  public static readonly itemsName: string = "Cloudpages";
  public static readonly type: string = "Cloudpage";
  private static readonly pageSize: number = 500;
  private static readonly subTypes: string[] = ["landing-pages", "code-resources", "microsites", "smartcapture-forms"];

  private static Build(item: any, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                AssetId: item.siteAssetId,
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.SanitizeXml(item._code),
                ContentId: item.contentId,
                CreatedDate: item.createdDate,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                PageId: item.pageId,
                Path: item._path,
                Status: item.status,
                Subtype: item._subtype,
                Type: Cloudpage.type,
                Url: item.url
    });
  }

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
    for(const item of items2) {
      const res: any = items1.find((entry: any) => entry.pageId === item.pageId || entry.contentId === item.contentId);
      item._code = res?.html;
      items.push(Cloudpage.Build(item, BUid, BUname));
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
    const itemField: string | undefined = Utility.FindCaseIns(Cloudpage.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}