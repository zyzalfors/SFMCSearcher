import * as Utility from "/Logics/utility.js";

export class Asset {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Subtype", "TemplateId", "TemplateKey", "TemplateName", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  static searchFields = ["BUId", "BUName", "Content", "CreatedByName", "CreatedDate", "Id", "Key", "ModifiedByName", "ModifiedDate", "Name", "Path", "Subtype", "TemplateId", "TemplateKey", "TemplateName"];
  static itemsName = "Assets";
  static type = "Asset";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.category?.id,
                Contents: item._contents,
                CreatedByName: item.createdBy?.name,
                CreatedDate: item.createdDate,
                Id: item.id,
                Key: item.customerKey,
                ModifiedByName: item.modifiedBy?.name,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
                Subtype: item.assetType?.displayName,
                TemplateId: item._template?.id,
                TemplateKey: item._template?.key,
                TemplateName: item._template?.name,
                Type: Asset.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    const assetTypeIds = [2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 203, 207, 208, 209, 210, 211, 212, 213, 214, 216, 217, 218, 219, 220, 223, 224, 225, 226, 227, 228, 229, 230, 232, 233, 234, 235, 238];
    const assetFields = ["assetType", "category", "content", "createdBy", "createdDate", "customerKey", "id", "modifiedBy", "modifiedDate", "name", "views"];

    let page = 1, pageItems = [0];
    const body = {page: {page: page, pageSize: pageSize}, query: {property: "assetType.id", simpleOperator: "IN", values: assetTypeIds}, fields: assetFields};
    const folders = await Asset.GetFolders(stack);

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared`, "POST", body);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        pageItem._path = Utility.Utility.GetFullPath(pageItem.category.id, folders, pageItem);
        Asset.PopulateContents(pageItem);

        items.push(Asset.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
      body.page.page = page;
    }
    await Utility.Utility.SetStorage(BUid, BUname, Asset.itemsName, items);
  }

  static async GetFolders(stack) {
    const pageSize = 500, folders = [];
    let page = 1, pageItems = [0];

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://content-builder.s${stack}.marketingcloudapps.com/fuelapi/asset/v1/content/categories?$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach(entry => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  static PopulateContents(pageItem) {
    pageItem._contents = [];
    if(pageItem.content) pageItem._contents.push({content: pageItem.content, type: "main"});
    if(!pageItem.views || typeof pageItem.views !== "object") return;

    const viewNames = ["inApp", "LINE", "preheader", "push", "sms", "subjectline", "whatsappsession"];
    for(const viewName of Object.keys(pageItem.views)) {
      const view = pageItem.views[viewName];
      if(!view || typeof view !== "object") continue;

      if(viewName.toLowerCase() === "html") {
        if(view.content) pageItem._contents.push({content: view.content, id: view.template?.id, name: view.template?.name, type: viewName});

        pageItem._template = {id: view.template?.id, name: view.template?.name};
        if(!view.slots || typeof view.slots !== "object") continue;

        for(const slotName of Object.keys(view.slots)) {
          const blocks = view.slots[slotName]["blocks"];
          if(!blocks || typeof blocks !== "object") continue;

          for(const block of Object.values(blocks)) {
            if(block.content) pageItem._contents.push({content: block.content, id: block.id, key: block.customerKey, name: block.name, type: "block"});
          }
        }
      }
      else if(Utility.Utility.FindCaseIns(viewNames, viewName)) {
        if(view.content) pageItem._contents.push({content: view.content, type: viewName});
      }
      else if(viewName.toLowerCase() === "whatsapptemplate") {
        const id = view.meta?.options?.customBlockData?.template?.id;
        const key = view.meta?.options?.customBlockData?.template?.customerKey;
        const name = view.meta?.options?.customBlockData?.template?.name;

        if(view.content) pageItem._contents.push({content: view.content, id, key, name, type: viewName});
        pageItem._template = {id, key, name};
      }
    }
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Asset.searchFields, field);
    if(!field) return;

    switch(field) {
      case "Content":
        return item.Contents.find(entry => regex.test(entry.content));

      default:
        return regex.test(item[field]);
    }
  }

}