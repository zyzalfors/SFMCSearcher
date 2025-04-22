import * as Utility from "/Logics/utility.js";

export class AttributeGroup {

  static tableFields = ["BUId", "BUName", "Id", "Name", "UseDEs"];
  static searchFields = ["BUId", "BUName", "Id", "Name", "UsedDEKey", "UsedDEName", "UseDEs"];
  static itemsName = "AttributeGroups";
  static type = "AttributeGroup";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                Id: item.definitionID,
                Name: item.definitionName?.value,
                UsedDEs: item._usedDEs,
                UseDEs: item._usedDEs.length > 0,
                Type: AttributeGroup.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    let page = 1, pageItems = [0];

    const items = [];
    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/views/defaultView?$page=${page}&$pageSize=${pageSize}`);
      pageItems = pageData.data;

      for(const pageItem of pageItems) {
        pageItem._usedDEs = [];

        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/${pageItem.definitionID}/setDefinitions/views/defaultView?nestedPageSize=1000&$pageSize=1000&$page=1`);
        if(!Array.isArray(item.data)) {
          items.push(AttributeGroup.Build(pageItem, stack, BUid, BUname));
          continue;
        }

        for(const data of item.data) {
          if(!data.storageLogicalType || data.storageLogicalType.toLowerCase() !== "dataextension") continue;

          const DEid = data.storageReferenceID?.value;
          if(!DEid) continue;

          const DEitem = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}`);
          pageItem._usedDEs.push({id: DEitem.id, key: DEitem.customerKey, name: DEitem.name});
        }

        items.push(AttributeGroup.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
    await Utility.Utility.SetStorage(BUid, BUname, AttributeGroup.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(AttributeGroup.searchFields, field);
    if(!field) return;

    switch(field) {
      case "UsedDEKey":
        return item.UsedDEs.find(entry => regex.test(entry.key));

      case "UsedDEName":
        return item.UsedDEs.find(entry => regex.test(entry.name));

      default:
        return regex.test(item[field]);
    }
  }

}