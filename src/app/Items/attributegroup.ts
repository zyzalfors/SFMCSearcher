import { Utility } from "../Logics/utility";

export class AttributeGroup {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "UsedDEs"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Id", "Name", "UsedDEKey", "UsedDEName", "UsedDEs"];
  public static readonly itemsName: string = "AttributeGroups";
  public static readonly type: string = "AttributeGroup";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/views/defaultView?$page=${page}&$pageSize=${AttributeGroup.pageSize}`);
      pageItems = pageData.data;

      for(const pageItem of pageItems) {
        const item: any = {
          BUId: BUid,
          BUName: BUname,
          Id: pageItem.definitionID,
          Name: pageItem.definitionName?.value,
          DEs: [],
          UsedDEs: false,
          Type: AttributeGroup.type
        };

        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts-internal/v1/attributeGroups/${pageItem.definitionID}/setDefinitions/views/defaultView?nestedPageSize=1000&$pageSize=1000&$page=1`);
        if(!Array.isArray(_item.data)) {
          items.push(Utility.SanitizeObj(item));
          continue;
        }

        for(const data of _item.data) {
          if(!data.storageLogicalType || data.storageLogicalType.toLowerCase() !== "dataextension") continue;

          const DEid: any = data.storageReferenceID?.value;
          if(!DEid) continue;

          const DEitem: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}`);
          item.DEs.push({id: DEitem.id, key: DEitem.customerKey, name: DEitem.name});
        }

        item.UsedDEs = item.DEs.length > 0;
        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, AttributeGroup.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(AttributeGroup.searchFields, field);
    if(!searchField) return false;

    switch(searchField) {
      case "UsedDEKey":
        return item.DEs.find((entry: any) => regex.test(entry.key));

      case "UsedDEName":
        return item.DEs.find((entry: any) => regex.test(entry.name));

      default:
        return regex.test(item[searchField]);
    }
  }
}