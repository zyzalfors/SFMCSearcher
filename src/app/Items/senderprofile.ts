import { Utility } from "../Logics/utility";

export class SenderProfile {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Description", "Active", "FromEmail", "FromName", "Status", "Subtype", "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "CreatedBy", "CreatedDate", "Description", "FromEmail", "FromName", "Id", "Key", "ModifiedBy", "ModifiedDate", "Name"];
  public static readonly itemsName: string = "SenderProfiles";
  public static readonly type: string = "SenderProfile";
  private static readonly pageSize: number = 500;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jb-email-activity.s${stack}.marketingcloudapps.com/fuelapi/messaging-internal/v1/senderprofiles?$page=${page}&$pagesize=${SenderProfile.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const item: any = {
          Active: pageItem.isActive,
          BUId: BUid,
          BUName: BUname,
          CreatedBy: pageItem.createdBy,
          CreatedDate: pageItem.createdDate,
          Description: pageItem.description,
          FromEmail: pageItem.fromEmail,
          FromName: pageItem.fromName,
          Id: pageItem.id,
          Key: pageItem.key,
          ModifiedBy: pageItem.modifiedBy,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Status: pageItem.status,
          Subtype: pageItem.type,
          Type: SenderProfile.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, SenderProfile.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(SenderProfile.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}