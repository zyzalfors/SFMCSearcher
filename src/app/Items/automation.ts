import { Utility } from "../Logics/utility";

export class Automation {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Status", "LastRuntime", "Recurrence", "AlertEmails", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  public static readonly searchFields: string[] = ["ActivityName", "ActivityObjectId", "AlertEmails", "BUId", "BUName", "CreatedByName", "CreatedDate", "Id", "Key", "LastRuntime", "ModifiedByName", "ModifiedDate", "Name", "Path", "Recurrence", "Status", "StepAnnotation", "Subtype"];
  public static readonly itemsName: string = "Automations";
  public static readonly type: string = "Automation";

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
        const _item: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/automations/${pageItem.id}`);
        const steps: any[] = [];

        if(Array.isArray(_item?.steps)) {
          for(const _step of _item.steps) {
            const step: any = {Name: _step?.name, Description: _step?.description, Activities: []};
            steps.push(step);

            if(!Array.isArray(_step?.activities)) continue;

            for(const _act of _step.activities) step.Activities.push({Name: _act?.name, ActivityObjectId: _act?.activityObjectId});
          }
        }

        const item: any = {
          AlertEmails: Array.isArray(alerts) ? alerts.reduce((emails: any, entry: any) => `${emails},${entry.definition}`, "").replace(",", "") : "",
          BUId: BUid,
          BUName: BUname,
          CategoryId: _item?.categoryId,
          CreatedByName: pageItem.createdBy?.name,
          CreatedDate: pageItem.createdDate,
          Id: pageItem.id,
          Key: _item?.key,
          LastRuntime: _item?.lastRunTime,
          Link: `https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/#Instance/${pageItem.id}`,
          ModifiedByName: pageItem.modifiedBy?.name,
          ModifiedDate: pageItem.modifiedDate,
          Name: _item?.name,
          Path: Utility.GetFullPath(_item?.categoryId, folders),
          Recurrence: _item?.schedule?.icalRecur,
          Status: _item?.schedule?.scheduleStatus,
          Steps: steps,
          Subtype: _item?.type,
          Type: Automation.type
        };

        items.push(Utility.SanitizeObj(item));
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
    const searchField: string | undefined = Utility.FindCaseIns(Automation.searchFields, field);
    if(!searchField) return false;

    switch(searchField) {
      case "ActivityName":
        return item.Steps.find((step: any) => step.Activities.find((act: any) => regex.test(act.Name)));

      case "ActivityObjectId":
        return item.Steps.find((step: any) => step.Activities.find((act: any) => regex.test(act.ActivityObjectId)));

      case "StepAnnotation":
        return item.Steps.find((step: any) => regex.test(step.Name));

      default:
        return regex.test(item[searchField]);
    }
  }
}