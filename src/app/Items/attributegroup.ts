import { Utility } from "../Logics/utility";

export class AttributeGroup {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "UsedDEs"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Id", "Name", "UsedDEKey", "UsedDEName", "UsedDEs"];
  public static readonly itemsName: string = "AttributeGroups";
  public static readonly type: string = "AttributeGroup";
  private static readonly pageSize: number = 500;

  private static Build(item: any, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                Id: item.definitionID,
                Name: item.definitionName?.value,
                DEs: item._DEs,
                UsedDEs: item._DEs.length > 0,
                Type: AttributeGroup.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/views/defaultView?$page=${page}&$pageSize=${AttributeGroup.pageSize}`);
      pageItems = pageData.data;

      for(const pageItem of pageItems) {
        pageItem._DEs = [];

        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/${pageItem.definitionID}/setDefinitions/views/defaultView?nestedPageSize=1000&$pageSize=1000&$page=1`);
        if(!Array.isArray(item.data)) {
          items.push(AttributeGroup.Build(pageItem, BUid, BUname));
          continue;
        }

        for(const data of item.data) {
          if(!data.storageLogicalType || data.storageLogicalType.toLowerCase() !== "dataextension") continue;

          const DEid: any = data.storageReferenceID?.value;
          if(!DEid) continue;

          const DEitem: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}`);
          pageItem._DEs.push({id: DEitem.id, key: DEitem.customerKey, name: DEitem.name});
        }

        items.push(AttributeGroup.Build(pageItem, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, AttributeGroup.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(AttributeGroup.searchFields, field);
    if(!itemField) return false;

    switch(itemField) {
      case "UsedDEKey":
        return item.DEs.find((entry: any) => regex.test(entry.key));

      case "UsedDEName":
        return item.DEs.find((entry: any) => regex.test(entry.name));

      default:
        return regex.test(item[itemField]);
    }
  }
}