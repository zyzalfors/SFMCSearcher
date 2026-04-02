import { Utility } from "../Logics/utility";

export class CustomerJourney {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "DefinitionId", "Name", "Path", "Link", "SourceDE", "SourceDEId", "RunFilterCriteria", "RunSchedule", "RunScheduleMode", "TriggerAction", "TriggerEntryData", "TriggerFilterCriteria", "TriggerObject", "TriggerWho", "Status", "Version", "EventDefinitionId", "EventDefinitionKey", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["ActivityId", "ActivityKey", "ActivityName", "ActivityType", "AssetId", "AssetKey", "AssetName", "AssetType", "BUId", "BUName", "Content", "CreatedDate", "DefinitionId", "EventDefinitionId", "EventDefinitionKey", "Id", "ModifiedDate", "Name", "Path", "RunFilterCriteria", "RunSchedule", "RunScheduleMode", "SourceDE", "SourceDEId", "Status", "TriggerAction", "TriggerEntryData", "TriggerFilterCriteria", "TriggerObject", "TriggerWho", "TriggeredSendDescription", "TriggeredSendId", "TriggeredSendKey", "TriggeredSendName", "UpdateDEIds", "UpdateDEValues", "UpdateSFObjFields", "UpdateSFObjType", "UpdateSFObjValues"];
  public static readonly itemsName: string = "CustomerJourneys";
  public static readonly type: string = "CustomerJourney";
  private static readonly pageSize: number = 500;
  private static readonly assetFields: string[] = ["customerKey", "id", "name"];
  private static readonly actTypes: string[] = ["EMAILV2", "INAPPSYNCACTIVITY", "PUSHNOTIFICATIONACTIVITY", "SENDTOLINESYNC", "SMSSYNC", "WHATSAPPACTIVITY"];

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await CustomerJourney.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/?mostRecentVersionOnly=false&mostRecentVersionOrRunningOnly=true&extras=trigger&extras=activities&$page=${page}&$pagesize=${CustomerJourney.pageSize}`);
      pageItems = pageData.items;

      for(const pageItem of pageItems) {
        const eventDefinitionId: string = pageItem.triggers[0]?.metaData?.eventDefinitionId;
        const eventDefinition: any = eventDefinitionId ? await Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/interaction/v1/eventDefinitions/${eventDefinitionId}`) : null;

        const item: any = {
          Activities: [],
          BUId: BUid,
          BUName: BUname,
          CategoryId: pageItem.categoryId,
          CreatedDate: pageItem.createdDate,
          DefinitionId: pageItem.definitionId,
          EventDefinitionId: eventDefinitionId,
          EventDefinitionKey: eventDefinition?.eventDefinitionKey,
          ExitCriteria: pageItem.exits[0]?.configurationArguments?.criteria,
          Goal: pageItem.goals[0]?.configurationArguments?.criteria,
          Id: pageItem.id,
          Link: `https://mc.s${stack}.exacttarget.com/cloud/#app/Journey%20Builder/%23${pageItem.id}/${pageItem.version}`,
          ModifiedDate: pageItem.modifiedDate,
          Name: pageItem.name,
          Path: Utility.GetFullPath(pageItem.categoryId, folders),
          RunFilterCriteria: eventDefinition?.metaData?.criteriaDescription,
          RunSchedule: eventDefinition?.metaData?.scheduleFlowMode,
          RunScheduleMode: eventDefinition?.metaData?.runOnceScheduleMode,
          SourceDE: eventDefinition?.dataExtensionName,
          SourceDEId: eventDefinition?.dataExtensionId,
          Status: pageItem.status,
          TriggerAction: eventDefinition?.configurationArguments?.salesforceTriggerCriteria,
          TriggerEntryData: eventDefinition?.configurationArguments?.eventDataSummary,
          TriggerFilterCriteria: eventDefinition?.configurationArguments?.primaryObjectFilterSummary,
          TriggerObject: eventDefinition?.configurationArguments?.objectAPIName,
          TriggerWho: eventDefinition?.configurationArguments?.whoToInject,
          Type: CustomerJourney.type,
          Version: pageItem.version
        };

        await CustomerJourney.PopulateActivities(stack, item, pageItem);
        items.push(Utility.SanitizeObj(item));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, CustomerJourney.itemsName, items);
  }

  private static async PopulateActivities(stack: string, item: any, pageItem: any): Promise<void> {
    for(const act of pageItem.activities) {
      const DEdata: any = act.arguments?.activityData?.updateContactFields;
      const DEids: string = Array.isArray(DEdata) ? DEdata.reduce((id: any, entry: any) => `${id},${entry.dataExtensionId}`, "").replace(",", "") : undefined;
      const DEvals: string = Array.isArray(DEdata) ? DEdata.reduce((val: any, entry: any) => `${val},${entry.value}`, "").replace(",", "") : undefined;

      const SFObjData: any = act.arguments?.objectMap?.objects[0]?.fields;
      const SFObjFields: string = Array.isArray(SFObjData) ? SFObjData.reduce((name: any, entry: any) => `${name},${entry.FieldName}`, "").replace(",", "") : undefined;
      const SFObjValues: string = Array.isArray(SFObjData) ? SFObjData.reduce((val: any, entry: any) => `${val},${entry.FieldValue}`, "").replace(",", "") : undefined;

      const activity: any = {
        Criteria: act.configurationArguments?.criteria,
        Id: act.id,
        Key: act.key,
        Name: act.name,
        TriggeredSendId: act.configurationArguments?.triggeredSendId,
        TriggeredSendKey: act.configurationArguments?.triggeredSendKey,
        Type: act.type,
        UpdateDEIds: DEids,
        UpdateDEValues: DEvals,
        UpdateSFObjAction: act.arguments?.objectMap?.objects[0]?.action,
        UpdateSFObjFields: SFObjFields,
        UpdateSFObjType: act.arguments?.objectMap?.objects[0]?.type,
        UpdateSFObjValues: SFObjValues,
        WaitEndDateAttribute: act.configurationArguments?.waitEndDateAttributeExpression
      };

      const triggered: any = activity.TriggeredSendId ? await Utility.FetchJSON(`https://jb-email-activity.s${stack}.marketingcloudapps.com/fuelapi/messaging-internal/v1/messages/triggered/${activity.TriggeredSendId}`) : null;
      activity.TriggeredSendDescription = triggered?.description;
      activity.TriggeredSendName = triggered?.name;

      let assetTypeIds: any;
      let prop: any;
      let assetId: any;

      if(act.type === CustomerJourney.actTypes[0]) {
        assetTypeIds = [5, 207, 208, 209];
        prop = "data.email.legacy.legacyId";
        assetId = act.configurationArguments?.triggeredSend?.emailId;
      }
      else if(CustomerJourney.actTypes.includes(act.type, 1)) {
        assetTypeIds = [230];
        prop = "id";
        assetId = act.configurationArguments?.assetId;
      }

      if(assetTypeIds && prop && assetId) {
        const left: any = {property: "assetType.id", simpleOperator: "IN", values: assetTypeIds};
        const right: any = {property: prop, simpleOperator: "equals", value: assetId};
        const body: any = {page: {page: 1, pageSize: 1}, query: {leftOperand: left, logicalOperator: "AND", rightOperand: right}, fields: CustomerJourney.assetFields};
        const asset: any = (await Utility.FetchJSON(`https://mc.s${stack}.exacttarget.com/cloud/fuelapi/asset/v1/content/assets/query?scope=ours%2Cshared`, "POST", body)).items[0];

        activity.AssetId = asset?.id;
        activity.AssetKey = asset?.customerKey;
        activity.AssetName = asset?.name;
        activity.AssetType = asset?.assetType?.displayName;
      }

      item.Activities.push(activity);
    }
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = [];

    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://jbinteractions.s${stack}.marketingcloudapps.com/fuelapi/platform-internal/v1/categories/?$filter=categorytype%20eq%20journey&$page=${page}&$pagesize=${CustomerJourney.pageSize}`);
      pageItems = pageData.items;
      pageItems.forEach((entry: any) => folders.push(entry));

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    return folders;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(CustomerJourney.searchFields, field);
    if(!searchField) return false;

    switch(searchField) {
      case "ActivityId":
        return item.Activities.find((entry: any) => regex.test(entry.Id));

      case "ActivityKey":
        return item.Activities.find((entry: any) => regex.test(entry.Key));

      case "ActivityName":
        return item.Activities.find((entry: any) => regex.test(entry.Name));

      case "ActivityType":
        return item.Activities.find((entry: any) => regex.test(entry.Type));

      case "AssetId": case "AssetKey": case "AssetName": case "AssetType":
      case "TriggeredSendDescription": case "TriggeredSendId": case "TriggeredSendKey": case "TriggeredSendName":
      case "UpdateDEIds": case "UpdateDEValues":
      case "UpdateSFObjFields": case "UpdateSFObjType": case "UpdateSFObjValues":
        return item.Activities.find((entry: any) => regex.test(entry[searchField]));

      case "Content":
        return regex.test(item.ExitCriteria) || regex.test(item.Goal) || item.Activities.find((entry: any) => {
          return (entry.Type === "MULTICRITERIADECISION" && entry.Criteria && Object.values(entry.Criteria).find((val: any) => regex.test(val))) ||
                 (entry.Type === "WAIT" && regex.test(entry.WaitEndDateAttribute)
                );
        });

      default:
        return regex.test(item[searchField]);
    }
  }
}