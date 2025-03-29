import * as Utility from "../Logics/utility.js";

export class Cloudpage {

  static tableFields = ["AssetId", "BUId", "BUName", "CategoryId", "Code", "ContentId", "CreatedDate", "ModifiedDate", "Name", "PageId", "Path", "Status", "Subtype", "Url"];
  static searchFields = ["AssetId", "CategoryId", "Code", "ContentId", "CreatedDate", "ModifiedDate", "Name", "PageId", "Path", "Status", "Subtype", "Url"];
  static itemsName = "Cloudpages";
  static type = "cloudpage";

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
    const folders = await Utility.Utility.GetFolders(stack, ["cloudpages"]);
    const pageSize = 500;
    const cloudTypes = ["landing-pages", "code-resources", "microsites", "smartcapture-forms"];
    const items1 = [], items2 = [], data = [];
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/internal/v2/cloudpages/contents?$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.entities;
      items1.push(...pageItems);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    for(const type of cloudTypes) {
      page = 1;
      pageItems = [0];
      while(pageItems.length > 0) {
        const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/internal/v2/cloudpages/" + type + "?$page=" + page + "&$pagesize=" + pageSize);
        pageItems = pageData.entities;
        for(const pageItem of pageItems) {
          pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);
          pageItem._cloudType = type;
        }
        items2.push(...pageItems);
        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }
    for(const item of items2) {
      const res = items1.find(entry => entry.pageId === item.pageId || entry.contentId === item.contentId);
      item._code = res?.html;
      data.push(Cloudpage.Build(item, stack, BUid, BUname));
    }
    await Utility.Utility.SetStorage(BUid, BUname, Cloudpage.itemsName, data);
  }

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}
