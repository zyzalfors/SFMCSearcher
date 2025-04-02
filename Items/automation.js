import * as Utility from "../Logics/utility.js";

export class Automation {

  static tableFields = ["AlertEmails", "BUId", "BUName", "CategoryId", "CreatedByName", "CreatedDate", "Id", "Key", "LastRuntime", "Link", "ModifiedByName", "ModifiedDate", "Name", "Path", "Recurrence", "Status", "Subtype"];
  static searchFields = ["Activity", "AlertEmails", "CategoryId", "CreatedByName", "CreatedDate", "Id", "Key", "LastRuntime", "ModifiedByName", "ModifiedDate", "Name", "Path", "Recurrence", "Status", "Subtype"];
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
                Link: "https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/#Instance/" + item._id,
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
    const folders = await Automation.GetFolders(stack);
    let page = 1, pageItems = [0];
    while(pageItems.length > 0) {
      const data = [];
      const pageData = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/automation/definition/?$skip=" + (page - 1));
      pageItems = pageData.entry;
      for(const pageItem of pageItems) {
        const item = await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/automations/" + pageItem.id);
        const alerts = (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/automations/notifications/" + pageItem.id)).workers;
        item._alertEmails = Array.isArray(alerts) ? alerts.reduce((emails, entry) => emails + "," + entry.definition, "").replace(",", "") : "";
        item._createdByName = pageItem.createdBy?.name;
        item._createdDate = pageItem.createdDate;
        item._id = pageItem.id;
        item._modifiedByName = pageItem.modifiedBy?.name;
        item._modifiedDate = pageItem.modifiedDate;
        item._path = Utility.Utility.GetFullPath(item.categoryId, folders);
        data.push(Automation.Build(item, stack, BUid, BUname));
      }
      await Utility.Utility.SetStorage(BUid, BUname, Automation.itemsName, data);
      if(pageItems.length < pageData.itemsPerPage) break;
      page++;
    }
  }

  static async GetFolders(stack) {
    return (await Utility.Utility.FetchJSON("https://mc.s" + stack + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/automation/v1/folders/?$filter=categorytype%20eq%20automations")).items;
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Automation.searchFields, field);
    if(!field) return;
    switch(field) {
      case "Activity":
        return Array.isArray(item.Steps) &&
               item.Steps.find(step => Array.isArray(step.activities) && step.activities.find(act => regex.test(act.name)));
      default:
        return regex.test(item[field]);
    }
  }

}