import { Utility } from "../Logics/utility";

export class Asset {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Subtype", "TemplateId", "TemplateKey", "TemplateName", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Content", "CreatedByName", "CreatedDate", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "Subtype", "TemplateId", "TemplateKey", "TemplateName"];
  public static readonly itemsName: string = "Assets";
  public static readonly type: string = "Asset";
  private static readonly pageSize: number = 500;
  private static readonly assetTypeIds: number[] = [2, 3, 4, 5, 14, 15, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238];
  private static readonly assetFields: string[] = ["assetType", "category", "content", "createdBy", "createdDate", "customerKey", "id", "modifiedBy", "modifiedDate", "name", "slots", "views"];
  private static readonly viewNames: string[] = ["html", "inApp", "LINE", "preheader", "push", "sms", "subjectline", "whatsappsession", "whatsapptemplate"];

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const body: any = {page: {page: page, pageSize: Asset.pageSize}, query: {property: "assetType.id", simpleOperator: "IN", values: Asset.assetTypeIds}, fields: Asset.assetFields};
    const folders: any[] = await Asset.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared`, "POST", body);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        Asset.PopulateContents(pageItem);

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          CategoryId: pageItem.category?.id,
          Contents: pageItem._contents,
          CreatedByName: pageItem.createdBy?.name,
          CreatedDate: pageItem.createdDate,
          Id: pageItem.id,
          Key: pageItem.customerKey,
          ModifiedByName: pageItem.modifiedBy?.name,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Path: Utility.GetFullPath(pageItem.category?.id, folders, pageItem),
          Subtype: pageItem.assetType?.displayName,
          TemplateId: pageItem._template?.id,
          TemplateKey: pageItem._template?.key,
          TemplateName: pageItem._template?.name,
          Type: Asset.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
      body.page.page = page;
    }

    await Utility.StoreData(BUid, BUname, Asset.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = [];

    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://content-builder.s${stack}.marketingcloudapps.com/fuelapi/asset/v1/content/categories?$page=${page}&$pagesize=${Asset.pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach((entry: any) => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  private static PopulateSlotContents(obj: any, contents: any[]): void {
    if(!obj.slots || typeof obj.slots !== "object") return;

    for(const slotName of Object.keys(obj.slots)) {
      const blocks: any = obj.slots[slotName]["blocks"];
      if(!blocks || typeof blocks !== "object") continue;

      const blockVals: any[] = Object.values(blocks);
      for(const block of blockVals) {
        if(block.content) contents.push({Content: block.content, Id: block.id, Key: block.customerKey, Name: block.name, Type: "block"});
      }
    }
  }

  private static PopulateViewContents(pageItem: any): void {
    if(!pageItem.views || typeof pageItem.views !== "object") return;
    const slicedViewNames: string[] = Asset.viewNames.slice(1, Asset.viewNames.length - 1);

    for(const viewName of Object.keys(pageItem.views)) {
      const view: any = pageItem.views[viewName];
      if(!view || typeof view !== "object") continue;

      if(viewName.toLowerCase() === Asset.viewNames[0]) {
        const id: string = view.template?.id;
        const name: string = view.template?.name;

        if(view.content) pageItem._contents.push({Content: view.content, TemplateId: id, TemplateName: name, Type: viewName});
        pageItem._template = {id, name};
        Asset.PopulateSlotContents(view, pageItem._contents);
      }
      else if(Utility.FindCaseIns(slicedViewNames, viewName)) {
        if(view.content) pageItem._contents.push({Content: view.content, Type: viewName});
      }
      else if(viewName.toLowerCase() === Asset.viewNames[Asset.viewNames.length - 1]) {
        const id: string = view.meta?.options?.customBlockData?.template?.id;
        const key: string = view.meta?.options?.customBlockData?.template?.customerKey;
        const name: string = view.meta?.options?.customBlockData?.template?.name;

        if(view.content) pageItem._contents.push({Content: view.content, TemplateId: id, TemplateKey: key, TemplateName: name, Type: viewName});
        pageItem._template = {id, key, name};
      }
    }
  }

  private static PopulateContents(pageItem: any): void {
    pageItem._contents = [];
    if(pageItem.content) pageItem._contents.push({Content: pageItem.content, Type: "main"});

    Asset.PopulateSlotContents(pageItem, pageItem._contents);
    Asset.PopulateViewContents(pageItem);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Asset.searchFields, field);
    if(!searchField) return false;

    switch(searchField) {
      case "Content":
        return item.Contents.find((entry: any) => regex.test(entry.Content));

      default:
        return regex.test(item[searchField]);
    }
  }
}