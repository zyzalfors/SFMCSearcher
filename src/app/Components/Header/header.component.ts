import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

@Component({
  selector: "app-header",
  imports: [],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css"
})

export class HeaderComponent {
  @Input()
  public name!: string;

  @Input()
  public version!: string;

  @Input()
  public BUname: string | undefined;

  @Input()
  public BUid: string | undefined;

  @Output()
  private readonly emitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("search")
  private readonly search!: ElementRef;

  @ViewChild("load")
  private readonly load!: ElementRef;

  @ViewChild("export")
  private readonly export!: ElementRef;

  @ViewChild("deimport")
  private readonly deImport!: ElementRef;

  protected readonly logoIconUrl: string = "logoicon.png";

  protected readonly searchIconUrl: string = "searchicon.png";

  protected readonly loadIconUrl: string = "loadicon.png";

  protected readonly exportIconUrl: string = "exporticon.png";

  protected readonly deImportIconUrl: string = "deimporticon.png";

  protected OnClick(event: Event): void {
    const img: HTMLImageElement = event.target as HTMLImageElement;

    switch(img) {
      case this.search.nativeElement:
        this.emitter.emit({showSearch: true});
        break;

      case this.load.nativeElement:
        this.emitter.emit({showLoad: true});
        break;

      case this.export.nativeElement:
        this.emitter.emit({showExport: true});
        break;

      case this.deImport.nativeElement:
        this.emitter.emit({showDEImport: true});
        break;
    }
  }
}