import { Utility } from "../Logics/utility";

export class Automation {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Status", "LastRuntime", "Recurrence", "AlertEmails", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["ActivityName", "ActivityObjectId", "AlertEmails", "BUId", "BUName", "CreatedByName", "CreatedDate", "Id", "Key", "LastRuntime", "ModifiedByName", "ModifiedDate", "Name", "Path", "Recurrence", "Status", "StepAnnotation", "Subtype"];
  public static readonly itemsName: string = "Automations";
  public static readonly type: string = "Automation";

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
                AlertEmails: item._alertEmails,
                BUId: BUid,
                BUName: BUname,
                CategoryId: item.categoryId,
                CreatedByName: item._createdByName,
                CreatedDate: item._createdDate,
                Id: item._id,
                Key: item.key,
                LastRuntime: item.lastRunTime,
                Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/#Instance/${item._id}`,
                ModifiedByName: item._modifiedByName,
                ModifiedDate: item._modifiedDate,
                Name: item.name,
                Path: item._path,
                Recurrence: item.schedule?.icalRecur,
                Status: item.schedule?.scheduleStatus,
                Steps: item.steps,
                Subtype: item.type,
                Type: Automation.type
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    let page: number = 1;
    let pageItems: any[] = [0];
    const folders: any[] = await Automation.GetFolders(stack);

    const items: any[] = [];
    while(pageItems.length > 0) {
      const pageData: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/automation/definition/?$skip=${(page - 1)}`);
      pageItems = pageData.entry;

      for(const pageItem of pageItems) {
        const alerts: any = (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/notifications/${pageItem.id}`)).workers;

        const item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/automations/${pageItem.id}`);
        item._alertEmails = Array.isArray(alerts) ? alerts.reduce((emails: any, entry: any) => `${emails},${entry.definition}`, "").replace(",", "") : "";
        item._createdByName = pageItem.createdBy?.name;
        item._createdDate = pageItem.createdDate;
        item._id = pageItem.id;
        item._modifiedByName = pageItem.modifiedBy?.name;
        item._modifiedDate = pageItem.modifiedDate;
        item._path = Utility.GetFullPath(item.categoryId, folders);
        items.push(Automation.Build(item, stack, BUid, BUname));
      }

      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }

    await Utility.StoreData(BUid, BUname, Automation.itemsName, items);
  }

  private static async GetFolders(stack: string): Promise<any[]> {
    return (await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20automations`)).items;
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Automation.searchFields, field);
    if(!itemField) return false;

    switch(itemField) {
      case "ActivityName":
        return Array.isArray(item.Steps) && item.Steps.find((step: any) => Array.isArray(step.activities) && step.activities.find((act: any) => regex.test(act.name)));

      case "ActivityObjectId":
        return Array.isArray(item.Steps) && item.Steps.find((step: any) => Array.isArray(step.activities) && step.activities.find((act: any) => regex.test(act.activityObjectId)));

      case "StepAnnotation":
        return Array.isArray(item.Steps) && item.Steps.find((step: any) => regex.test(step.name));

      default:
        return regex.test(item[itemField]);
    }
  }
}