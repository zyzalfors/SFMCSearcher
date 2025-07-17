import { Utility } from "../Logics/utility";

export class Image {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Url", "Extension", "Size", "Height", "Width", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedByName", "CreatedDate", "Extension", "Height", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "Size", "Subtype", "Url", "Width"];
  public static readonly itemsName: string = "Images";
  public static readonly type: string = "Image";
  private static readonly pageSize: number = 500;
  private static readonly imageTypeIds: number[] = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
  private static readonly imageFields: string[] = ["assetType", "category", "createdBy", "createdDate", "customerKey", "fileProperties", "id", "modifiedBy", "modifiedDate", "name"];

  private static Build(item: any, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.category?.id,
                CreatedByName: item.createdBy?.name,
                CreatedDate: item.createdDate,
                Extension: item.fileProperties?.extension,
                Height: item.fileProperties?.height,
                Id: item.id,
                Key: item.customerKey,
                ModifiedByName: item.modifiedBy?.name,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Size: item.fileProperties?.fileSize,
                Subtype: item.assetType?.displayName,
                Type: Image.type,
                Url: item.fileProperties?.publishedURL,
                Width: item.fileProperties?.width
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const body: any = {page: {page: page, pageSize: Image.pageSize}, query: {property: "assetType.id", simpleOperator: "IN", values: Image.imageTypeIds}, fields: Image.imageFields};
    const folders: any[] = await Image.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared`, "POST", body);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        pageItem._path = Utility.GetFullPath(pageItem.category.id, folders, pageItem);
        items.push(Image.Build(pageItem, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
      body.page.page = page;
    }

    await Utility.StoreData(BUid, BUname, Image.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = [];

    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://content-builder.s${stack}.marketingcloudapps.com/fuelapi/asset/v1/content/categories?$page=${page}&$pagesize=${Image.pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach((entry: any) => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Image.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}