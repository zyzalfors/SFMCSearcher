import { Utility } from "../Logics/utility";

export class SendClassification {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Description", "Active", "SendPriority", "DeliveryProfileId", "SenderProfileId", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedBy", "CreatedDate", "DeliveryProfileId", "Description", "Key", "ModifiedBy", "ModifiedDate", "Name", "SenderProfileId"];
  public static readonly itemsName: string = "SendClassifications";
  public static readonly type: string = "SendClassification";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jb-email-activity.s${stack}.marketingcloudapps.com/fuelapi/messaging-internal/v1/sendclassifications?$page=${page}&$pagesize=${SendClassification.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = {
          Active: pageItem.isActive,
          BUId: BUid,
          BUName: BUname,
          CreatedBy: pageItem.createdBy,
          CreatedDate: pageItem.createdDate,
          DeliveryProfileId: pageItem.deliveryProfileId,
          Description: pageItem.description,
          Id: pageItem.id,
          Key: pageItem.key,
          ModifiedBy: pageItem.modifiedBy,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          SenderProfileId: pageItem.senderProfileId,
          SendPriority: pageItem.sendPriority,
          Type: SendClassification.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, SendClassification.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(SendClassification.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}