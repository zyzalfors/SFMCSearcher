import { Utility } from "../Logics/utility";

export class Contact {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Addresses"];
  public static readonly searchFields: string[] = ["Addresses", "BUId", "BUName", "Id", "Key"];
  public static readonly itemsName: string = "Contacts";
  public static readonly type: string = "Contact";
  private static readonly pageSize: number = 10000;

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];

    const html: string = await Utility.FetchHTML(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html`);
    const match: RegExpMatchArray | null = html.match(/csrfToken\s*=\s*'([^']+)'/);
    const token: string = match ? match[1] : "";

    const map: any = {};
    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/contacts/v1/addresses/search/channel/?$pageSize=${Contact.pageSize}&$page=${page}`, "POST", {}, token);
      pageItems = pageData.addresses;

      for(const pageItem of pageItems) {
        const id: string = pageItem.contactID?.value;
        const addr: string = pageItem.addressID?.value || pageItem.addressKey?.value;

        if(!map[id]) {
          map[id] = {
            Addresses: [addr],
            BUId: BUid,
            BUName: BUname,
            Id: id,
            Key: pageItem.contactKey?.value,
            Type: Contact.type
          };
        }
        else if(addr) {
          if(map[id].Addresses.at(-1)) map[id].Addresses.push(addr);
          else map[id].Addresses[map[id].Addresses.length - 1] = addr;
        }
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    for(const id in map) {
      map[id].Addresses = map[id].Addresses.join(",");
      items.push(Utility.SanitizeObj(map[id]));
    }

    await Utility.StoreData(BUid, BUname, Contact.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Contact.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}