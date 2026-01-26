import { Utility } from "../Logics/utility";

export class Package {

  public static readonly tableFields: string[] = ["BUId", "BUName", "Id", "Name", "Link", "Owner", "Status", "ClientId", "ClientSecret", "AuthEndpoint", "RestEndpoint", "SoapEndpoint", "Signature", "InstallDate", "ModifiedDate"];
  public static readonly searchFields: string[] = ["AuthEndpoint", "BUId", "BUName", "ClientId", "ClientSecret", "Id", "InstallDate", "ModifiedDate", "Name", "Owner", "RestEndpoint", "SoapEndpoint", "Status"];
  public static readonly itemsName: string = "Packages";
  public static readonly type: string = "Package";

  public static async Load(stack: string, BUid: string, BUname: string): Promise<void> {
    const pageData: any = await Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/LoadInstalledPackages`);

    const items: any[] = [];
    for(const pageItem of pageData.PackageData) {
      const _item: any = await Utility.FetchJSON(`https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackagesService/loadPackageDetails?applicationId=${pageItem.PackageId}`);

      const item: any = {
        AuthEndpoint: _item?.Components[0]?.Endpoints?.AuthEndpoint,
        BUId: BUid,
        BUName: BUname,
        ClientId: _item?.Components[0]?.ClientId,
        ClientSecret: _item?.Components[0]?.ClientSecret,
        Id: _item?.PackageId,
        InstallDate: pageItem.InstallDate,
        Link: `https://members.s${stack}.exacttarget.com/Content/Administration/InstalledPackages.aspx/${_item?.PackageId}/details`,
        ModifiedDate: _item?.ApplicationLastUpdated,
        Name: _item?.Name,
        Owner: _item?.OwnerName,
        RestEndpoint: _item?.Components[0]?.Endpoints?.RestEndpoint,
        Signature: _item?.ApplicationSignature,
        SoapEndpoint: _item?.Components[0]?.Endpoints?.SoapEndpoint,
        Status: _item?.PackageStatus,
        Type: Package.type
      };

      items.push(Utility.SanitizeObj(item));
    }

    await Utility.StoreData(BUid, BUname, Package.itemsName, items);
  }

  public static Check(item: any, field: string, regex: RegExp): boolean {
    const searchField: string | undefined = Utility.FindCaseIns(Package.searchFields, field);
    if(!searchField) return false;

    return regex.test(item[searchField]);
  }
}