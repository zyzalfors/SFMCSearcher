import * as Utility from "../Logics/utility.js";

export class CustomerJourney {

  static tableFields = ["BUId", "BUName", "CreatedDate", "EventDefinitionId", "EventDefinitionKey", "FilterCriteria", "Id", "Link", "ModifiedDate", "Name", "Schedule", "ScheduleMode", "SourceDE", "SourceDEId", "Status", "Version"];
  static searchFields = ["ActivityId", "ActivityName", "AssetId", "AssetKey", "AssetName", "CreatedDate", "EventDefinitionId", "EventDefinitionKey", "FilterCriteria", "Id", "ModifiedDate", "Name", "Schedule", "ScheduleMode", "SourceDE", "SourceDEId", "Status", "TriggeredSendId", "UsedDE"];
  static itemsName = "CustomerJourneys";
  static type = "customerjourney";

  static Build(item, stack, BUid, BUname) {
    const o = {
                Activities: item.activities,
                BUId: BUid,
                BUName: BUname,
                ConfigurationArguments: item._configurationArguments,
                CreatedDate: item.createdDate,
                EventDefinitionId: item._eventDefinitionId,
                EventDefinitionKey: item._eventDefinitionKey,
                Exits: item.exits,
                FilterCriteria: item._metaData?.criteriaDescription,
                Id: item.id,
                Link: "https://mc.s" + stack + ".exacttarget.com/cloud/#app/Journey%20Builder/%23" + item.id + "/" + item.version,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Schedule: item._metaData?.scheduleFlowMode,
                ScheduleMode: item._metaData?.runOnceScheduleMode,
                SourceDE: item._dataExtensionName,
                SourceDEId: item._dataExtensionId,
                Status: item.status,
                Type: CustomerJourney.type,
                Version: item.version
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageSize = 50;
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/interaction/v1/interactions/?mostRecentVersionOnly=false&mostRecentVersionOrRunningOnly=true&extras=trigger&extras=activities&$page=" + page + "&$pagesize=" + pageSize);
      pageItems = pageData.items;
      for(const pageItem of pageItems) {
        const eventDefinitionId = pageItem.triggers[0]?.metaData?.eventDefinitionId;
        const eventDefinition = eventDefinitionId ? await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/interaction/v1/eventDefinitions/" + eventDefinitionId) : null;
        pageItem._dataExtensionId = eventDefinition?.dataExtensionId;
        pageItem._dataExtensionName = eventDefinition?.dataExtensionName;
        pageItem._eventDefinitionId = eventDefinitionId;
        pageItem._eventDefinitionKey = eventDefinition?.eventDefinitionKey;
        pageItem._metaData = eventDefinition?.metaData;
        pageItem._configurationArguments = eventDefinition?.configurationArguments;
        for(const act of pageItem.activities) {
          let assetTypeIds, prop, assetId;
          if(act.type === "EMAILV2") {
            assetTypeIds = [5, 207, 208, 209];
            prop = "data.email.legacy.legacyId";
            assetId = act.configurationArguments?.triggeredSend?.emailId;
          }
          else if(act.type === "SMSSYNC" || act.type === "WHATSAPPACTIVITY") {
            assetTypeIds = [230];
            prop = "id";
            assetId = act.configurationArguments?.assetId;
          }
          if(!assetTypeIds || !assetId) continue;
          const body = {page: {page: 1, pageSize: 1},
                        query: {leftOperand: {property: "assetType.id", simpleOperator: "IN", values: assetTypeIds},
                                logicalOperator: "AND",
                                rightOperand: {property: prop, simpleOperator: "equals", value: assetId}},
                        fields: ["customerKey", "id", "name"]};
          const asset = (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared", "POST", body)).items[0];
          act._AssetId = asset?.id;
          act._AssetName = asset?.name;
          act._AssetKey = asset?.customerKey;
        }
        data.push(CustomerJourney.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, CustomerJourney.itemsName, data);
      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static Check(item, field, regex) {
    const actTypes = ["EMAILV2", "SMSSYNC", "WHATSAPPACTIVITY"];
    switch(field) {
      case "ActivityId":
        return Array.isArray(item.Activities) && item.Activities.find(act => regex.test(act.id));
      case "ActivityName":
        return Array.isArray(item.Activities) && item.Activities.find(act => regex.test(act.name));
      case "AssetId": case "AssetKey": case "AssetName":
        return Array.isArray(item.Activities) && item.Activities.find(act => actTypes.includes(act.type) && regex.test(act["_" + field]));
      case "TriggeredSendId":
        return Array.isArray(item.Activities) && item.Activities.find(act => actTypes.includes(act.type) && regex.test(act.configurationArguments?.triggeredSendId));
      case "UsedDE":
        const exitCriteria = item.Exits[0]?.configurationArguments?.criteria;
        return (exitCriteria && regex.test(exitCriteria)) || (Array.isArray(item.Activities) && item.Activities.find(act => {
                  const criteria = act.configurationArguments?.criteria;
                  const attr = act.configurationArguments?.waitEndDateAttributeExpression;
                  return (act.type === "MULTICRITERIADECISION" && criteria && Object.values(criteria).find(val => regex.test(val))) ||
                         (act.type === "WAIT" && attr && regex.test(attr));
                }));
      default:
        return regex.test(item[field]);
    }
  }

}
