import { Utility } from "../Logics/utility";

export class CustomerJourney {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "DefinitionId", "Name", "Path", "Link", "SourceDE", "SourceDEId", "FilterCriteria", "Schedule", "ScheduleMode", "Status", "Version", "EventDefinitionId", "EventDefinitionKey", "CreatedDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["ActivityId", "ActivityName", "AssetId", "AssetKey", "AssetName", "BUId", "BUName", "CreatedDate", "DefinitionId", "EventDefinitionId", "EventDefinitionKey", "FilterCriteria", "Id", "ModifiedDate", "Name", "Path", "Schedule", "ScheduleMode", "SourceDE", "SourceDEId", "Status", "TriggeredSendId", "TriggeredSendKey", "UsedContent"];
  public static readonly itemsName: string = "CustomerJourneys";
  public static readonly type: string = "CustomerJourney";
  private static readonly pageSize: number = 500;
  private static readonly assetFields: string[] = ["customerKey", "id", "name"];
  private static readonly actTypes: string[] = ["EMAILV2", "INAPPSYNCACTIVITY", "PUSHNOTIFICATIONACTIVITY", "SENDTOLINESYNC", "SMSSYNC", "WHATSAPPACTIVITY"];
  private static readonly actFields: string[] = ["_AssetId", "_AssetKey", "_AssetName", "configurationArguments", "id", "name", "type"];

  private static Build(item: any, stack: string, BUid: string, BUname: string): void {
    return Utility.SanitizeObj({
                Activities: item.activities,
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                ConfigurationArguments: item._configurationArguments,
                CreatedDate: item.createdDate,
                DefinitionId: item.definitionId,
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
    });
  }

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

        pageItem._dataExtensionId = eventDefinition?.dataExtensionId;
        pageItem._dataExtensionName = eventDefinition?.dataExtensionName;
        pageItem._eventDefinitionId = eventDefinitionId;
        pageItem._eventDefinitionKey = eventDefinition?.eventDefinitionKey;
        pageItem._metaData = eventDefinition?.metaData;
        pageItem._configurationArguments = eventDefinition?.configurationArguments;
        pageItem._path = Utility.GetFullPath(pageItem.categoryId, folders);

        for(const act of pageItem.activities) {
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
            act._AssetId = asset?.id;
            act._AssetName = asset?.name;
            act._AssetKey = asset?.customerKey;
          }

          for(const field in act) {
            if(!CustomerJourney.actFields.includes(field)) delete act[field];
          }
        }

        items.push(CustomerJourney.Build(pageItem, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.pageSize) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, CustomerJourney.itemsName, items);
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
    const itemField: string | undefined = Utility.FindCaseIns(CustomerJourney.searchFields, field);
    if(!itemField) return false;

    switch(itemField) {
      case "ActivityId":
        return Array.isArray(item.Activities) && item.Activities.find((entry: any) => regex.test(entry.id));

      case "ActivityName":
        return Array.isArray(item.Activities) && item.Activities.find((entry: any) => regex.test(entry.name));

      case "AssetId": case "AssetKey": case "AssetName":
        return Array.isArray(item.Activities) && item.Activities.find((entry: any) => CustomerJourney.actTypes.includes(entry.type) && regex.test(entry[`_${itemField}`]));

      case "TriggeredSendId":
        return Array.isArray(item.Activities) && item.Activities.find((entry: any) => CustomerJourney.actTypes.includes(entry.type) && regex.test(entry.configurationArguments?.triggeredSendId));

      case "TriggeredSendKey":
        return Array.isArray(item.Activities) && item.Activities.find((entry: any) => CustomerJourney.actTypes.includes(entry.type) && regex.test(entry.configurationArguments?.triggeredSendKey));

      case "UsedContent":
        const exitCriteria: string = item.Exits[0]?.configurationArguments?.criteria;
        return (exitCriteria && regex.test(exitCriteria)) || (Array.isArray(item.Activities) && item.Activities.find((act: any) => {
                  const criteria: any = act.configurationArguments?.criteria;
                  const attr: string = act.configurationArguments?.waitEndDateAttributeExpression;

                  return (act.type === "MULTICRITERIADECISION" && criteria && Object.values(criteria).find((val: any) => regex.test(val))) || (act.type === "WAIT" && attr && regex.test(attr));
        }));

      default:
        return regex.test(item[itemField]);
    }
  }
}