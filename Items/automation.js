import * as Utility from "../Logics/utility.js";

export class Automation {

  static tableFields = ["BUId", "BUName", "Id", "Key", "Name", "Path", "Link", "Status", "LastRuntime", "Recurrence", "AlertEmails", "Subtype", "CreatedByName", "CreatedDate", "ModifiedByName", "ModifiedDate"];
  static searchFields = ["ActivityName", "ActivityObjectId", "AlertEmails", "CreatedByName", "CreatedDate", "Id", "Key", "LastRuntime", "ModifiedByName", "ModifiedDate", "Name", "Path", "Recurrence", "Status", "StepAnnotation", "Subtype"];
  static itemsName = "Automations";
  static type = "automation";

  static Build(item, stack, BUid, BUname) {
    const o = {
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
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    let page = 1, pageItems = [0];
    const folders = await Automation.GetFolders(stack);

    while(pageItems.length > 0) {
      const pageData = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/automation/definition/?$skip=${(page - 1)}`);
      pageItems = pageData.entry;

      const items = [];
      for(const pageItem of pageItems) {
        const alerts = (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/notifications/${pageItem.id}`)).workers;

        const item = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/automations/${pageItem.id}`);
        item._alertEmails = Array.isArray(alerts) ? alerts.reduce((emails, entry) => `${emails},${entry.definition}`, "").replace(",", "") : "";
        item._createdByName = pageItem.createdBy?.name;
        item._createdDate = pageItem.createdDate;
        item._id = pageItem.id;
        item._modifiedByName = pageItem.modifiedBy?.name;
        item._modifiedDate = pageItem.modifiedDate;
        item._path = Utility.Utility.GetFullPath(item.categoryId, folders);

        items.push(Automation.Build(item, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Automation.itemsName, items);

      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20automations`)).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Automation.searchFields, field);
    if(!field) return;

    switch(field) {
      case "ActivityName":
        return Array.isArray(item.Steps) && item.Steps.find(step => Array.isArray(step.activities) && step.activities.find(act => regex.test(act.name)));

      case "ActivityObjectId":
        return Array.isArray(item.Steps) && item.Steps.find(step => Array.isArray(step.activities) && step.activities.find(act => regex.test(act.activityObjectId)));

      case "StepAnnotation":
        return Array.isArray(item.Steps) && item.Steps.find(step => regex.test(step.name));

      default:
        return regex.test(item[field]);
    }
  }

}