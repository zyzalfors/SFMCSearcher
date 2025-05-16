import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { Controller } from "../../Logics/controller";

@Component({
  selector: "app-load",
  imports: [],
  templateUrl: "./load.component.html",
  styleUrl: "./load.component.css"
})

export class LoadComponent {
  @ViewChild("items")
  private readonly items!: ElementRef;

  @ViewChild("load")
  private readonly load!: ElementRef;

  @ViewChild("import")
  private readonly import!: ElementRef;

  @ViewChild("imp")
  private readonly imp!: ElementRef;

  @Output()
  private readonly emitter = new EventEmitter<any>();

  public ngAfterViewInit(): void {
    const frag: DocumentFragment = document.createDocumentFragment();
    const items: HTMLSelectElement = this.items.nativeElement;

    for(const item of Controller.items) {
      const option: HTMLOptionElement = document.createElement("option");
      option.text = item.class.itemsName;
      option.value = item.class.itemsName;
      frag.appendChild(option);
    }
    items.appendChild(frag);
  }

  public async Process(ev: Event): Promise<void> {
    const button: HTMLButtonElement = ev.target as HTMLButtonElement;
    const text: string = button.innerText;
    button.innerText += "ing...";
    button.disabled = true;

    try {
      switch(button) {
        case this.load.nativeElement:
          await Controller.Process({actionName: "load", itemsName: this.items.nativeElement.value});
          this.emitter.emit();
          break;

        case this.import.nativeElement:
          this.imp.nativeElement.click();
          break;
      }
    }
    catch(err: any) {
      console.log(err);
      window.alert(err);
    }
    finally {
      button.innerText = text;
      button.disabled = false;
    }
  }

  public ProcessImport(): void {
    const input: HTMLInputElement = this.imp.nativeElement;
    const files: FileList = input.files as FileList;
    if(files.length === 0) return;

    const file: File = files[0];
    const reader: FileReader = new FileReader();

    reader.addEventListener("load", async () => {
      try {
        const action: any = Controller.actions.find((entry: any) => entry.name === "import");
        if(!action) return;
        await action.Proc(JSON.parse(reader.result as string));
      }
      catch(err: any) {
        console.log(err);
        window.alert(err);
      }
      finally {
        input.value = "";
        this.emitter.emit();
      }
    });

    reader.addEventListener("error", () => {
      window.alert("Error reading the file");
    });

    reader.readAsText(file);
  }
}