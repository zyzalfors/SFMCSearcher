import { Utility } from "../Logics/utility";

export class Message {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "Link", "Code", "Concatenate", "FromName", "Keyword", "NextKeyword", "Status", "Template", "Text", "Sent", "Delivered", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "Concatenate", "Delivered", "FromName", "Id", "Keyword", "ModifiedDate", "Name", "NextKeyword", "Sent", "Status", "Template", "Text"];
  public static readonly itemsName: string = "Messages";
  public static readonly type: string = "Message";

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/mobileconnectfuel3/fuelapi//legacy/v1/beta/mobile/message?view=details&version=3&$skip=${(page - 1)}`);
      pageItems = pageData.entry;

      for(const pageItem of pageItems) {
        const sent: number = pageItem.statistics?.outbound?.sent;
        const delivered: number = pageItem.statistics?.outbound?.delivered;

        const item: any = {
          BUId: BUid,
          BUName: BUname,
          Code: pageItem.code?.code,
          Concatenate: pageItem.concatenateMessage,
          Delivered: !isNaN(sent) && sent > 0 && !isNaN(delivered) ? `${((delivered / sent) * 100).toFixed(2)}%` : null,
          FromName: pageItem.fromName,
          Id: pageItem.id,
          Keyword: pageItem.keyword?.keyword,
          Link: `https://mc.s${stack}.exacttarget.com/cloud/#app/MobileConnect/Mobile/%23!/message/view/${pageItem.id}`,
          ModifiedDate: pageItem.lastUpdated,
          Name: pageItem.name,
          NextKeyword: pageItem.nextKeyword?.keyword,
          Sent: sent,
          Status: pageItem.status,
          Template: pageItem.template?.name,
          Text: Utility.SanitizeXml(pageItem.text),
          Type: Message.type
        };

        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Message.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Message.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}