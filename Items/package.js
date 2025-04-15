import * as Utility from "/Logics/utility.js";

export class Package {

  static tableFields = ["BUId", "BUName", "Id", "Name", "Link", "Owner", "Status", "ClientId", "ClientSecret", "AuthEndpoint", "RestEndpoint", "SoapEndpoint", "Signature", "InstallDate", "ModifiedDate"];
  static searchFields = ["AuthEndpoint", "BUId", "BUName", "ClientId", "ClientSecret", "Id", "InstallDate", "ModifiedDate", "Name", "Owner", "RestEndpoint", "SoapEndpoint", "Status"];
  static itemsName = "Packages";
  static type = "Package";

  static Build(item, stack, BUid, BUname) {
    const o = {
                AuthEndpoint: item.Components[0]?.Endpoints?.AuthEndpoint,
                BUId: BUid,
                BUName: BUname,
                ClientId: item.Components[0]?.ClientId,
                ClientSecret: item.Components[0]?.ClientSecret,
                Id: item.PackageId,
                InstallDate: item._installDate,
                Link: `https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackages.aspx/${item.PackageId}/details`,
                ModifiedDate: item.ApplicationLastUpdated,
                Name: item.Name,
                Owner: item.OwnerName,
                RestEndpoint: item.Components[0]?.Endpoints?.RestEndpoint,
                Signature: item.ApplicationSignature,
                SoapEndpoint: item.Components[0]?.Endpoints?.SoapEndpoint,
                Status: item.PackageStatus,
                Type: Package.type
              };
    Utility.Utility.SanitizeObj(o);
    return o;
  }

  static async Load(stack, BUid, BUname) {
    const pageData = await Utility.Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/LoadInstalledPackages`);
    const pageItems = pageData.PackageData;

    const items = [];
    for(const pageItem of pageItems) {
      const item = await Utility.Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/loadPackageDetails?applicationId=${pageItem.PackageId}`);
      item._installDate = pageItem.InstallDate;

      items.push(Package.Build(item, stack, BUid, BUname));
    }
    await Utility.Utility.SetStorage(BUid, BUname, Package.itemsName, items);
  }

  static Check(item, field, regex) {
    field = Utility.Utility.FindCaseIns(Package.searchFields, field);
    if(!field) return;

    return regex.test(item[field]);
  }

}