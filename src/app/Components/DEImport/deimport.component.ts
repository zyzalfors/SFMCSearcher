import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { Controller } from "../../Logics/controller";
import { DEImporter } from "../../Logics/deimporter";

@Component({
  selector: "app-deimport",
  imports: [],
  templateUrl: "./deimport.component.html",
  styleUrl: "./deimport.component.css"
})

export class DEImportComponent {
  @ViewChild("dename")
  private readonly deName!: ElementRef;

  @ViewChild("devalues")
  private readonly deValues!: ElementRef;

  @ViewChild("sep")
  private readonly sep!: ElementRef;

  @ViewChild("chunksize")
  private readonly chunkSize!: ElementRef;

  @ViewChild("methods")
  private readonly methods!: ElementRef;

  @Output()
  protected readonly emitter = new EventEmitter<any>();

  public ngAfterViewInit(): void {
    const frag: DocumentFragment = document.createDocumentFragment();

    for(const method of DEImporter.methods) {
      const option: HTMLOptionElement = document.createElement("option");
      option.text = method;
      option.value = method;
      frag.appendChild(option);
    }

    this.methods.nativeElement.appendChild(frag);
  }

  protected async Process(ev: Event): Promise<void> {
    const button: HTMLButtonElement = ev.target as HTMLButtonElement;
    const text: string = button.innerText;
    button.innerText += "ing...";
    button.disabled = true;

    try {
      await Controller.Process({
        actionName: "deimport",
        DEname: this.deName.nativeElement.value.trim(),
        data: this.deValues.nativeElement.value,
        sep: this.sep.nativeElement.value.trim(),
        chunkSize: this.chunkSize.nativeElement.value.trim(),
        method: this.methods.nativeElement.value
      });
    }
    catch(err: any) {
      console.log(err);
      this.emitter.emit({err: err});
    }
    finally {
      button.innerText = text;
      button.disabled = false;
    }
  }
}
