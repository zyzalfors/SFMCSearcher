import { Utility } from "../Logics/utility";

export class JourneyHistoryEntry {

  public static readonly tableFields: string[] = ["BUId", "BUName", "ContactKey", "ActivityName", "ActivityType", "ActivityId", "Status", "Time", "JourneyName", "DefinitionId", "EventDefinitionId"];
  public static readonly searchFields: string[] = ["ActivityId", "ActivityName", "ActivityType", "BUId", "BUName", "ContactKey", "DefinitionId", "EventDefinitionId", "JourneyName", "Status", "Time"];
  public static readonly itemsName: string = "JourneyHistoryEntries";
  public static readonly type: string = "JourneyHistoryEntry";
  private static readonly pageSize: number = 500;

  private static Build(item: any, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                ActivityId: item.activityId,
                ActivityName: item.activityName,
                ActivityType: item.activityType,
                BUId: BUid,
                BUName: BUname,
                ContactKey: item.contactKey,
                DefinitionId: item.definitionId,
                EventDefinitionId: item.eventId,
                JourneyName: item.definitionName,
                Status: item.status,
                Time: item.transactionTime,
                Type: JourneyHistoryEntry.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const ids: string[] = [];

    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/?mostRecentVersionOnly=false&mostRecentVersionOrRunningOnly=true&$page=${page}&$pagesize=${JourneyHistoryEntry.pageSize}`);
      pageItems = pageData.items;
      for(const pageItem of pageItems) ids.push(pageItem.definitionId);

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    const start: Date = new Date();
    start.setDate(start.getDate() - 30);
    const startUTC: Date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0));

    const end: Date = new Date();
    end.setDate(end.getDate() + 1);
    const endUTC: Date = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 0, 0, 0));

    const body: any = {start: startUTC.toISOString(), end: endUTC.toISOString()};

    const html: string = await Utility.FetchHTML(`https://jbinteractions.s${stack}.marketingcloudapps.com`);
    const match: RegExpMatchArray | null = html.match(/csrfToken:\s*'([^']+)'/);
    const token: string = match ? match[1] : "";

    const items: any[] = [];
    for(const id of ids) {
      page = 1;
      pageItems = [0];
      body.definitionIds = [id];

      while(pageItems.length > 0) {
        const pageData: any = await Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/journeyhistory/search?$page=${page}&$pageSize=${JourneyHistoryEntry.pageSize}&%24orderBy=TransactionTime%20desc`, "POST", body, token);
        pageItems = pageData.items;
        if(!Array.isArray(pageItems)) break;

        for(const pageItem of pageItems) items.push(JourneyHistoryEntry.Build(pageItem, BUid, BUname));

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }

    await Utility.StoreData(BUid, BUname, JourneyHistoryEntry.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(JourneyHistoryEntry.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}