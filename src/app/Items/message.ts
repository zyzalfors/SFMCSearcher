import { Utility } from "../Logics/utility";

export class Message {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "Link", "Code", "Concatenate", "FromName", "Keyword", "NextKeyword", "Status", "Template", "Text", "Sent", "Delivered", "ModifiedDate"];
  public static readonly searchFields: string[] = ["BUId", "BUName", "Code", "Concatenate", "Delivered", "FromName", "Id", "Keyword", "ModifiedDate", "Name", "NextKeyword", "Sent", "Status", "Template", "Text"];
  public static readonly itemsName: string = "Messages";
  public static readonly type: string = "Message";

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    const sent : number = item.statistics?.outbound?.sent;
    const delivered : number = item.statistics?.outbound?.delivered;

    return Utility.SanitizeObj({
                BUId: BUid,
                BUName: BUname,
                Code: item.code?.code,
                Concatenate: item.concatenateMessage,
                Delivered: !isNaN(sent) && sent > 0 && !isNaN(delivered) ? `${((delivered / sent) * 100).toFixed(2)}%` : null,
                FromName: item.fromName,
                Id: item.id,
                Keyword: item.keyword?.keyword,
                Link: `https://mc.s${stack}.exacttarget.com/cloud/#app/MobileConnect/Mobile/%23!/message/view/${item.id}`,
                ModifiedDate: item.lastUpdated,
                Name: item.name,
                NextKeyword: item.nextKeyword?.keyword,
                Sent: sent,
                Status: item.status,
                Template: item.template?.name,
                Text: Utility.SanitizeXml(item.text),
                Type: Message.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/mobileconnectfuel3/fuelapi//legacy/v1/beta/mobile/message?view=details&version=3&$skip=${(page - 1)}`);
      pageItems = pageData.entry;

      for(const pageItem of pageItems) items.push(Message.Build(pageItem, stack, BUid, BUname));

      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Message.itemsName, items);
  }


  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Message.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}