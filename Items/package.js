import * as Utility from "../Logics/utility.js";

export class Package {

  static tableFields = ["AuthEndpoint", "BUId", "BUName", "ClientId", "ClientSecret", "Id", "Link", "ModifiedDate", "Name", "Owner", "RestEndpoint", "Signature", "SoapEndpoint", "Status"];
  static searchFields = ["AuthEndpoint", "ClientId", "ClientSecret", "Id", "ModifiedDate", "Name", "Owner", "RestEndpoint", "Signature", "SoapEndpoint", "Status"];
  static itemsName = "Packages";
  static type = "package";

  static Build(item, stack, BUid, BUname) {
    const o = {
                AuthEndpoint: item.Components[0]?.Endpoints?.AuthEndpoint,
                BUId: BUid,
                BUName: BUname,
                ClientId: item.Components[0]?.ClientId,
                ClientSecret: item.Components[0]?.ClientSecret,
                Id: item.PackageId,
                Link: "https://members.s" + stack + ".exacttarget.com/Content/Administration/InstalledPackages.aspx/" + item.PackageId + "/details",
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
    const data = [];
    const pageData = await Utility.Utility.FetchJSON("https://members.s" + stack + ".exacttarget.com/Content/Administration/InstalledPackagesService/LoadInstalledPackages");
    const pageItems = pageData.PackageData;
    for(const pageItem of pageItems) {
      const item = await Utility.Utility.FetchJSON("https://members.s" + stack + ".exacttarget.com/Content/Administration/InstalledPackagesService/loadPackageDetails?applicationId=" + pageItem.PackageId);
      data.push(Package.Build(item, stack, BUid, BUname));
    }
    await Utility.Utility.SetStorage(BUid, BUname, Package.itemsName, data);
  }

  static Check(item, field, regex) {
    return regex.test(item[field]);
  }

}