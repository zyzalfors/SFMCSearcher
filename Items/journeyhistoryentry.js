import * as Utility from "/Logics/utility.js";

export class JourneyHistoryEntry {

  static tableFields = ["BUId", "BUName", "ContactKey", "ActivityName", "ActivityType", "ActivityId", "Status", "Time", "JourneyName", "DefinitionId", "EventDefinitionId"];
  static searchFields = ["ActivityId", "ActivityName", "ActivityType", "BUId", "BUName", "ContactKey", "DefinitionId", "EventDefinitionId", "JourneyName", "Status", "Time"];
  static itemsName = "JourneyHistoryEntries";
  static type = "JourneyHistoryEntry";

  static Build(item, stack, BUid, BUname) {
    const o = {
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
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 500;

    let page = 1, pageItems = [0];
    const ids = [];

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/?mostRecentVersionOnly=false&mostRecentVersionOrRunningOnly=true&$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;
      for(const pageItem of pageItems) ids.push(pageItem.definitionId);

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    const body = {start: start.toISOString(), end: end.toISOString()};

    const html = await Utility.Utility.FetchHTML(`https://jbinteractions.s${stack}.marketingcloudapps.com`);
    const match = html.match(/csrfToken:\s*'([^']+)'/);
    const token = match ? match[1] : null;

    const items = [];
    for(const id of ids) {
      page = 1;
      pageItems = [0];
      body.definitionIds = [id];

      while(pageItems.length > 0) {
        const pageData = await Utility.Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/journeyhistory/search?$page=${page}&$pageSize=${pageSize}&%24orderBy=TransactionTime%20desc`, "POST", body, token);
        pageItems = pageData.items;
        if(!Array.isArray(pageItems)) break;

        for(const pageItem of pageItems) items.push(JourneyHistoryEntry.Build(pageItem, stack, BUid, BUname));

        if(pageItems.length < pageData.pageSize) break;
        page++;
      }
    }
    await Utility.Utility.SetStorage(BUid, BUname, JourneyHistoryEntry.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(JourneyHistoryEntry.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}