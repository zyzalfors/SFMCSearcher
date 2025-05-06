import * as Utility from "/Logics/utility.js";

export class DEImporter {

  static methods = ["Delete", "Insert", "Overwrite", "Update"];

  static async Import(stack, DEname, data, sep, chunkSize, method) {
    if(!Utility.Utility.FindCaseIns(DEImporter.methods, method)) return;

    const DEdata = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/legacy/v1/v1/object/?name=${DEname}`);
    const DEid = DEdata?.entry[0]?.id;

    const DEfields = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}/fields`);
    if(DEfields.message) throw new Error(DEfields.message);

    const keyFields = [];
    for(const field of DEfields.fields) {
      if(field.isPrimaryKey) keyFields.push(field.name);
    }

    if(!sep) sep = ",";
    const rows = data.split("\n");
    const headers = rows[0].split(sep);

    const body = [];
    for(let i = 1; i < rows.length; i++) {
      const entry = {keys: {}, values: {}};
      body.push(entry);

      const vals = rows[i].split(sep);
      for(const j in vals) {
        const header = headers[j];

        if(Utility.Utility.FindCaseIns(keyFields, header)) entry.keys[header] = vals[j];
        else entry.values[header] = vals[j];
      }
    }
    if(body.length === 0) return;

    const html = await Utility.Utility.FetchHTML(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html`);
    const match = html.match(/csrfToken\s*=\s*'([^']+)'/);
    const token = match ? match[1] : null;

    let par;
    switch(method) {
      case "Delete":
        par = `/${method.toLowerCase()}`;
        body.forEach(entry => delete entry.values);
        break;

      case "Overwrite":
        par = "?method=insert";
        await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}/cleardata`, "POST", {}, token);
        break;

      default:
        par = `?method=${method.toLowerCase()}`;
    }

    if(isNaN(chunkSize) || chunkSize <= 0) chunkSize = 200;
    const end = Math.ceil(body.length / chunkSize);

    for(let i = 0; i < end; i++) {
      const subBody = body.slice(i * chunkSize, (i + 1) * chunkSize);

      const resp = await Utility.Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/hub/v1/dataevents/${DEid}/rowset${par}`, "POST", subBody, token);
      if(resp.message) throw new Error(resp.message);
    }
  }

}