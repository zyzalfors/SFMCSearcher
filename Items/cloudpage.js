import * as Utility from "/Logics/utility.js";

export class Cloudpage {

  static tableFields = ["BUId", "BUName", "AssetId", "ContentId", "PageId", "Name", "Path", "Status", "Url", "Code", "Subtype", "CreatedDate", "ModifiedDate"];
  static searchFields = ["AssetId", "BUId", "BUName", "Code", "ContentId", "CreatedDate", "ModifiedDate", "Name", "PageId", "Path", "Status", "Subtype", "Url"];
  static itemsName = "Cloudpages";
  static type = "Cloudpage";

  static Build(item, stack, BUid, BUname) {
    const o = {
                AssetId: item.siteAssetId,
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                Code: Utility.Utility.SanitizeXml(item._code),
                ContentId: item.contentId,
                CreatedDate: item.createdDate,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                PageId: item.pageId,
                Path: item._path,
                Status: item.status,
                Subtype: item._cloudType,
                Type: Cloudpage.type,
                Url: item.url
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    const cloudTypes = ["landing-pages", "code-resources", "microsites", "smartcapture-forms"];

    let page = 1, pageItems = [0];
    const folders = await Cloudpage.GetFolders(stack);

    const items1 = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://cloud-pages.s${stack}.marketingcloudapps.com/fuelapi/internal/v2/cloudpages/contents?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.entities;
      pageItems.forEach(entry => items1.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    const items2 = [];
    for(const type of cloudTypes) {
      page = 1;
      pageItems = [0];

      while(pageItems.length > 0) {
        const pageData = await Utility.Utility.FetchJSON(`https://cloud-pages.s${stack}.marketingcloudapps.com/fuelapi/internal/v2/cloudpages/${type}?$page=${page}&$pagesize=${pageSize}`);
        pageItems = pageData.entities;

        for(const pageItem of pageItems) {
          pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
          pageItem._cloudType = type;
        }
        pageItems.forEach(entry => items2.push(entry));

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    const items = [];
    for(const item of items2) {
      const res = items1.find(entry => entry.pageId === item.pageId || entry.contentId === item.contentId);
      item._code = res?.html;

      items.push(Cloudpage.Build(item, stack, BUid, BUname));
    }
    await Utility.Utility.SetStorage(BUid, BUname, Cloudpage.itemsName, items);
  }

  static async GetFolders(stack) {
    const pageSize = 500, folders = [];
    let page = 1, pageItems = [0];

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://content-builder.s${stack}.marketingcloudapps.com/fuelapi/asset/v1/content/categories?categoryType=cloudpages&$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach(entry => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Cloudpage.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}