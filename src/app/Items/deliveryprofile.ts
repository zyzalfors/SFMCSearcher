import { Utility } from "../Logics/utility";

export class DeliveryProfile {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Description", "Ip", "Active", "FooterSalutationSource", "HeaderSalutationSource", "DomainType", "SourceAddressType", "Subtype", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedBy", "CreatedDate", "Description", "Id", "Ip", "Key", "ModifiedBy", "ModifiedDate", "Name"];
  public static readonly itemsName: string = "DeliveryProfiles";
  public static readonly type: string = "DeliveryProfile";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jb-email-activity.s${stack}.marketingcloudapps.com/fuelapi/messaging-internal/v1/deliveryprofiles?$page=${page}&$pagesize=${DeliveryProfile.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = {
          Active: pageItem.isActive,
          BUId: BUid,
          BUName: BUname,
          CreatedBy: pageItem.createdBy,
          CreatedDate: pageItem.createdDate,
          Description: pageItem.description,
          DomainType: pageItem.domainType,
          FooterSalutationSource: pageItem.footerSalutationSource,
          HeaderSalutationSource: pageItem.headerSalutationSource,
          Id: pageItem.id,
          Ip: pageItem.ipAddress,
          Key: pageItem.key,
          ModifiedBy: pageItem.modifiedBy,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          SourceAddressType: pageItem.sourceAddressType,
          Subtype: pageItem.deliveryProfileType,
          Type: DeliveryProfile.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, DeliveryProfile.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(DeliveryProfile.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}