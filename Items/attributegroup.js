import * as Utility from "../Logics/utility.js";

export class AttributeGroup {

  static tableFields = ["BUId", "BUName", "Id", "Name"];
  static searchFields = ["Id", "Name", "UsedDEKey", "UsedDEName"];
  static itemsName = "AttributeGroups";
  static type = "attributegroup";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                Id: item.definitionID,
                Name: item.definitionName?.value,
                UsedDEs: item._usedDEs,
                Type: AttributeGroup.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/views/defaultView?$page=" + page + "&$pageSize=" + pageSize);
      pageItems = pageData.data;
      for(const pageItem of pageItems) {
        pageItem._usedDEs = [];
        const item = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/" + pageItem.definitionID + "/setDefinitions/views/defaultView?nestedPageSize=1000&$pageSize=1000&$page=1");
        if(!Array.isArray(item.data)) continue;
        for(const entry of item.data) {
          if(!entry.storageLogicalType || entry.storageLogicalType.toLowerCase() !== "dataextension") continue;
          const DEid = entry.storageReferenceID?.value;
          if(!DEid) continue;
          const DEitem = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/" + DEid);
          pageItem._usedDEs.push({id: DEitem.id, key: DEitem.customerKey, name: DEitem.name});
        }
        data.push(AttributeGroup.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, AttributeGroup.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static Check(item, field, regex) {
    switch(field) {
      case "UsedDEKey":
        return item.UsedDEs.find(de => regex.test(de.key));
      case "UsedDEName":
        return item.UsedDEs.find(de => regex.test(de.name));
      default:
        return regex.test(item[field]);
    }
  }

}
