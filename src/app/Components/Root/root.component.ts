/// <reference types="chrome"/>
import { Component, ElementRef, ViewChild } from "@angular/core";
import { HeaderComponent } from "../Header/header.component";
import { SearchComponent } from "../Search/search.component";
import { LoadComponent } from "../Load/load.component";
import { ExportComponent } from "../Export/export.component";
import { DEImportComponent } from "../DEImport/deimport.component";
import { ResultsComponent } from "../Results/results.component";
import { Utility } from "../../Logics/utility";

@Component({
  selector: "app-root",
  imports: [HeaderComponent, SearchComponent, LoadComponent, ExportComponent, DEImportComponent, ResultsComponent],
  templateUrl: "./root.component.html",
  styleUrl: "./root.component.css"
})

export class RootComponent {
  public name!: string;
  public version!: string;
  public BUname: string | undefined;
  public BUid: string | undefined;
  public showSearch = true;
  public showLoad = false;
  public showExport = false;
  public showDEImport = false;

  @ViewChild("results")
  private readonly results!: ResultsComponent;

  @ViewChild("search")
  private readonly search!: SearchComponent;

  @ViewChild("export")
  private readonly export!: SearchComponent;

  private async GetBUData(): Promise<any> {
    try {
      return await Utility.GetSiteBUData();
    }
    catch(err: any) {
      console.log(err);
    }
  }

  public async ngAfterViewInit(): Promise<void> {
    const manifest: chrome.runtime.Manifest = chrome.runtime.getManifest();
    const data: any = await this.GetBUData();

    this.name = manifest.name;
    this.version = manifest.version;
    this.BUname = data?.BUname;
    this.BUid = data?.BUid;
  }

  public OnHeaderEmitted(flags: any): void {
    this.showSearch = flags.showSearch;
    this.showLoad = flags.showLoad;
    this.showExport = flags.showExport;
    this.showDEImport = flags.showDEImport;
  }

  public async OnExportEmitted(inp: any): Promise<void> {
    switch(true) {
      case inp.export:
        await this.results.Export();
        break;

      case inp.clear:
        await this.search.InitBUs();
        break;
    }
  }

  public async OnLoadEmitted(): Promise<void> {
    await this.search.InitBUs();
    await this.export.InitBUs();
  }

  public OnSearchEmitted(res: any): void {
    this.results.Populate(res);
  }
}