/// <reference types="chrome"/>
import { Component, ViewChild } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from "../Header/header.component";
import { SearchComponent } from "../Search/search.component";
import { LoadComponent } from "../Load/load.component";
import { ExportComponent } from "../Export/export.component";
import { DEImportComponent } from "../DEImport/deimport.component";
import { ResultsComponent } from "../Results/results.component";
import { MessageBoxComponent } from "../MessageBox/messagebox.component";
import { Utility } from "../../Logics/utility";

@Component({
  selector: "app-root",
  imports: [HeaderComponent, SearchComponent, LoadComponent, ExportComponent, DEImportComponent, ResultsComponent],
  templateUrl: "./root.component.html",
  styleUrl: "./root.component.css"
})

export class RootComponent {
  protected name!: string;

  protected version!: string;

  protected BUname: string | undefined;

  protected BUid: string | undefined;

  protected showSearch: boolean = true;

  protected showLoad: boolean = false;

  protected showExport: boolean = false;

  protected showDEImport: boolean = false;

  @ViewChild("results")
  private readonly results!: ResultsComponent;

  @ViewChild("search")
  private readonly search!: SearchComponent;

  @ViewChild("export")
  private readonly export!: ExportComponent;

  protected readonly dialog!: MatDialog;

  private static async GetBUData(): Promise<any> {
    try {
      return await Utility.GetSiteBUData();
    }
    catch(err: any) {
      console.log(err);
    }
  }

  public constructor(dialog: MatDialog) {
    this.dialog = dialog;
  }

  public async ngAfterViewInit(): Promise<void> {
    const manifest: chrome.runtime.Manifest = chrome.runtime.getManifest();
    const data: any = await RootComponent.GetBUData();

    this.name = manifest.name;
    this.version = manifest.version;
    this.BUname = data?.BUname;
    this.BUid = data?.BUid;
  }

  public OnHeaderEmitted(inp: any): void {
    this.showSearch = inp.showSearch;
    this.showLoad = inp.showLoad;
    this.showExport = inp.showExport;
    this.showDEImport = inp.showDEImport;
  }

  protected async OnExportEmitted(inp: any): Promise<void> {
    if(inp.err) this.ShowMessageBox(inp.err.message);
    else {
      switch(true) {
        case inp.export:
          await this.results.Export();
          break;

        case inp.clear:
          await this.search.InitBUs();
          break;
      }
    }
  }

  protected async OnLoadEmitted(inp: any): Promise<void> {
    if(inp.err) this.ShowMessageBox(inp.err.message);
    else {
      await this.search.InitBUs();
      await this.export.InitBUs();
    }
  }

  protected OnSearchEmitted(inp: any): void {
    if(inp.err) this.ShowMessageBox(inp.err.message);
    else this.results.Populate(inp);
  }

  protected OnDEImportEmitted(inp: any): void {
    if(inp.err) this.ShowMessageBox(inp.err.message);
  }

  protected ShowMessageBox(message: string): void {
    this.dialog.open(MessageBoxComponent, {disableClose: true, data: {message: message}});
  }
}