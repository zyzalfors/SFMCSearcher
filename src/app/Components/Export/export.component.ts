import { Component, ElementRef, ViewChild } from "@angular/core";
import { InputComponent } from "../Input/input.component";
import { Controller } from "../../Logics/controller";

@Component({
  selector: "app-export",
  imports: [],
  templateUrl: "./export.component.html",
  styleUrl: "./export.component.css"
})

export class ExportComponent extends InputComponent {
  @ViewChild("clear")
  private readonly clear!: ElementRef;

  @ViewChild("export")
  private readonly export!: ElementRef;

  @ViewChild("view")
  private readonly view!: ElementRef;

  @ViewChild("resexport")
  private readonly resExport!: ElementRef;

  protected async Process(ev: Event): Promise<void> {
    const button: HTMLButtonElement = ev.target as HTMLButtonElement;
    const text: string = button.innerText;
    button.innerText += "ing...";
    button.disabled = true;

    let init: boolean = false;
    try {
      switch(button) {
        case this.clear.nativeElement:
          init = true;
          await Controller.Process({actionName: "clear", BUid: this.BUs.nativeElement.value, itemsName: this.items.nativeElement.value});
          this.emitter.emit({clear: true});
          break;

        case this.export.nativeElement:
          await Controller.Process({actionName: "export", BUid: this.BUs.nativeElement.value, itemsName: this.items.nativeElement.value});
          break;

        case this.view.nativeElement:
          await Controller.Process({actionName: "view", BUid: this.BUs.nativeElement.value, itemsName: this.items.nativeElement.value});
          break;

        case this.resExport.nativeElement:
          this.emitter.emit({export: true});
          break;
      }
    }
    catch(err: any) {
      console.log(err);
      this.emitter.emit({err: err});
    }
    finally {
      button.innerText = text;
      button.disabled = false;
      if(init) await this.InitBUs();
    }
  }
}