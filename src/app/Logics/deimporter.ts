import { Utility } from "./utility";

export class DEImporter {

  public static methods: string[] = ["Delete", "Insert", "Overwrite", "Update"];
  private static sep: string = ",";

  static async Import(stack: string, DEname: string, data: string, sep: string, chunkSize: number, method: string): Promise<void> {
    if(!Utility.FindCaseIns(DEImporter.methods, method)) return;

    const DEdata: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/legacy/v1/v1/object/?name=${DEname}`);
    const DEid: any = DEdata?.entry[0]?.id;

    const DEfields: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}/fields`);
    if(DEfields.message) throw new Error(DEfields.message);

    const keyFields: string[] = [];
    for(const field of DEfields.fields) {
      if(field.isPrimaryKey) keyFields.push(field.name);
    }

    if(!sep) sep = DEImporter.sep;
    const rows: string[] = data.split("\n");
    const headers: string[] = rows[0].split(sep);

    const body: any[] = [];
    for(let i: number = 1; i < rows.length; i++) {
      const entry: any = {keys: {}, values: {}};
      body.push(entry);

      const vals: string[] = rows[i].split(sep);
      for(const j in vals) {
        const header: string = headers[j];

        if(Utility.FindCaseIns(keyFields, header)) entry.keys[header] = vals[j];
        else entry.values[header] = vals[j];
      }
    }
    if(body.length === 0) return;

    const html: string = await Utility.FetchHTML(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/admin.html`);
    const match: RegExpMatchArray | null = html.match(/csrfToken\s*=\s*'([^']+)'/);
    const token: string = match ? match[1] : "";

    let par: string;
    switch(method) {
      case "Delete":
        par = `/${method.toLowerCase()}`;
        body.forEach((entry: any) => delete entry.values);
        break;

      case "Overwrite":
        par = "?method=insert";
        try {
          await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/internal/v1/customobjects/${DEid}/cleardata`, "POST", {}, token);
        }
        catch {}
        break;

      default:
        par = `?method=${method.toLowerCase()}`;
    }

    if(isNaN(chunkSize) || chunkSize <= 0) chunkSize = 200;
    const end: number = Math.ceil(body.length / chunkSize);

    for(let i: number = 0; i < end; i++) {
      const subBody: any[] = body.slice(i * chunkSize, (i + 1) * chunkSize);

      const resp: any = await Utility.FetchJSON(`https://mc.s${stack}.marketingcloudapps.com/contactsmeta/fuelapi/hub/v1/dataevents/${DEid}/rowset${par}`, "POST", subBody, token);
      if(resp.message) throw new Error(resp.message);
    }
  }
}