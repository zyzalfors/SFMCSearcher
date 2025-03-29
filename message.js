import * as Utility from "../Logics/utility.js";

export class Message {

  static tableFields = ["BUId", "BUName", "Code", "Concatenate", "FromName", "Id", "Keyword", "Link", "ModifiedDate", "Name", "NextKeyword", "Status", "Template", "Text"];
  static searchFields = ["Code", "Concatenate", "FromName", "Id", "Keyword", "ModifiedDate", "Name", "NextKeyword", "Status", "Template", "Text"];
  static itemsName = "Messages";
  static type = "message";

  static Build(item, stack, BUid, BUname) {
    const o = {
                BUId: BUid,
                BUName: BUname,
                Code: item.code?.code,
                Concatenate: item.concatenateMessage,
                FromName: item.fromName,
                Id: item.id,
                Keyword: item.keyword?.keyword,
                Link: "https://mc.s" + stack + ".exacttarget.com/cloud/#app/MobileConnect/Mobile/%23!/message/view/" + item.id,
                ModifiedDate: item.lastUpdated,
                Name: item.name,
                NextKeyword: item.nextKeyword?.keyword,
                Status: item.status,
                Template: item.template?.name,
                Text: Utility.Utility.SanitizeXml(item.text),
                Type: Message.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/mobileconnectfuel3/fuelapi//legacy/v1/beta/mobile/message?view=details&version=3&$skip=" + (page - 1));
      pageItems = pageData.entry;
      for(const pageItem of pageItems) data.push(Message.Build(pageItem, stack, BUid, BUname));
      await Utility.Utility.SetStorage(BUid, BUname, Message.itemsName, data);
      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }
  }

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}