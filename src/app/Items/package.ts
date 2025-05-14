import { Utility } from "../Logics/utility";

export class Package {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "Link", "Owner", "Status", "ClientId", "ClientSecret", "AuthEndpoint", "RestEndpoint", "SoapEndpoint", "Signature", "InstallDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AuthEndpoint", "BUId", "BUName", "ClientId", "ClientSecret", "Id", "InstallDate", "ModifiedDate", "Name", "Owner", "RestEndpoint", "SoapEndpoint", "Status"];
  public static readonly itemsName: string = "Packages";
  public static readonly type: string = "Package";

  private static Build(item: any, stack: string, BUid: string, BUname: string): any {
    return Utility.SanitizeObj({
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
    });
  }

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    const pageData: any = await Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/LoadInstalledPackages`);

    const items: any[] = [];
    for(const pageItem of pageData.PackageData) {
      const item: any = await Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/loadPackageDetails?applicationId=${pageItem.PackageId}`);
      item._installDate = pageItem.InstallDate;
      items.push(Package.Build(item, stack, BUid, BUname));
    }

    await Utility.StoreData(BUid, BUname, Package.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const itemField: string | undefined = Utility.FindCaseIns(Package.searchFields, field);
    if(!itemField) return false;

    return regex.test(item[itemField]);
  }
}