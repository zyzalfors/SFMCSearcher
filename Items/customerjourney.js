import * as Utility from "../Logics/utility.js";

export class CustomerJourney {

  static tableFields = ["BUId", "BUName", "Id", "Name", "Path", "Link", "SourceDE", "SourceDEId", "FilterCriteria", "Schedule", "ScheduleMode", "Status", "Version", "EventDefinitionId", "EventDefinitionKey", "CreatedDate", "ModifiedDate"];
  static searchFields = ["ActivityId", "ActivityName", "AssetId", "AssetKey", "AssetName", "CreatedDate", "EventDefinitionId", "EventDefinitionKey", "FilterCriteria", "Id", "ModifiedDate", "Name", "Path", "Schedule", "ScheduleMode", "SourceDE", "SourceDEId", "Status", "TriggeredSendId", "UsedDE"];
  static itemsName = "CustomerJourneys";
  static type = "CustomerJourney";

  static Build(item, stack, BUid, BUname) {
    const o = {
                Activities: item.activities,
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                ConfigurationArguments: item._configurationArguments,
                CreatedDate: item.createdDate,
                EventDefinitionId: item._eventDefinitionId,
                EventDefinitionKey: item._eventDefinitionKey,
                Exits: item.exits,
                FilterCriteria: item._metaData?.criteriaDescription,
                Id: item.id,
                Link: `https://mc.s${stack}.exacttarget.com/cloud/#app/Journey%20Builder/%23${item.id}/${item.version}`,
                ModifiedDate: item.modifiedDate,
                Name: item.name,
                Path: item._path,
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
    const assetFields = ["customerKey", "id", "name"];

    let page = 1, pageItems = [0];
    const folders = await CustomerJourney.GetFolders(stack);

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/?mostRecentVersionOnly=false&mostRecentVersionOrRunningOnly=true&extras=trigger&extras=activities&$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;

      const items = [];
      for(const pageItem of pageItems) {
        const eventDefinitionId = pageItem.triggers[0]?.metaData?.eventDefinitionId;
        const eventDefinition = eventDefinitionId ? await Utility.Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/eventDefinitions/${eventDefinitionId}`) : null;

        pageItem._dataExtensionId = eventDefinition?.dataExtensionId;
        pageItem._dataExtensionName = eventDefinition?.dataExtensionName;
        pageItem._eventDefinitionId = eventDefinitionId;
        pageItem._eventDefinitionKey = eventDefinition?.eventDefinitionKey;
        pageItem._metaData = eventDefinition?.metaData;
        pageItem._configurationArguments = eventDefinition?.configurationArguments;
        pageItem._path = Utility.Utility.GetFullPath(pageItem.categoryId, folders);

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

          const left = {property: "assetType.id", simpleOperator: "IN", values: assetTypeIds};
          const right = {property: prop, simpleOperator: "equals", value: assetId};
          const body = {page: {page: 1, pageSize: 1}, query: {leftOperand: left, logicalOperator: "AND", rightOperand: right}, fields: assetFields};

          const asset = (await Utility.Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared`, "POST", body)).items[0];
          act._AssetId = asset?.id;
          act._AssetName = asset?.name;
          act._AssetKey = asset?.customerKey;
        }

        items.push(CustomerJourney.Build(pageItem, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, CustomerJourney.itemsName, items);

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    const pageSize = 500, folders = [];
    let page = 1, pageItems = [0];

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/platform-internal/v1/categories/?$filter=categorytype%20eq%20journey&$page=${page}&$pagesize=${pageSize}`);
      pageItems = pageData.items;
      folders.push(...pageItems);

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(CustomerJourney.searchFields, field);
    if(!field) return;

    const actTypes = ["EMAILV2", "SMSSYNC", "WHATSAPPACTIVITY"];
    switch(field) {
      case "ActivityId":
        return Array.isArray(item.Activities) && item.Activities.find(entry => regex.test(entry.id));

      case "ActivityName":
        return Array.isArray(item.Activities) && item.Activities.find(entry => regex.test(entry.name));

      case "AssetId": case "AssetKey": case "AssetName":
        return Array.isArray(item.Activities) && item.Activities.find(entry => actTypes.includes(entry.type) && regex.test(entry[`_${field}`]));

      case "TriggeredSendId":
        return Array.isArray(item.Activities) && item.Activities.find(entry => actTypes.includes(entry.type) && regex.test(entry.configurationArguments?.triggeredSendId));

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