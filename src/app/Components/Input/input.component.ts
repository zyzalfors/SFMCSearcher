import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { Utility } from "../../Logics/utility";
import { Controller } from "../../Logics/controller";

@Component({
  selector: "app-input",
  imports: [],
  templateUrl: "./input.component.html",
  styleUrl: "./input.component.css"
})

export abstract class InputComponent {
  @ViewChild("bus")
  protected readonly BUs!: ElementRef;

  @ViewChild("items")
  protected readonly items!: ElementRef;

  @ViewChild("fields")
  protected readonly fields!: ElementRef;

  @Output()
  protected readonly emitter: EventEmitter<any> = new EventEmitter<any>();

  public async InitBUs(): Promise<void> {
    const BUs: HTMLSelectElement = this.BUs.nativeElement;
    BUs.innerHTML = "";

    const frag: DocumentFragment = document.createDocumentFragment();
    const data: any[] = await Utility.GetBUData();

    if(data.length > 1) {
      const option: HTMLOptionElement = document.createElement("option");
      option.text = "--All--";
      option.value = "";
      frag.appendChild(option);
    }

    for(const entry of data) {
      const option: HTMLOptionElement = document.createElement("option");
      option.text = `${entry.BUname} (${entry.BUid})`;
      option.value = entry.BUid;
      frag.appendChild(option);
    }

    BUs.appendChild(frag);
    await this.InitItems();
  }

  protected async InitItems(): Promise<void> {
    const items: HTMLSelectElement = this.items.nativeElement;
    items.innerHTML = "";

    const BUid: string = this.BUs.nativeElement.value;
    const itemsNames: string[] = await Utility.GetItemsData(BUid);

    const frag: DocumentFragment = document.createDocumentFragment();
    for(const itemsName of itemsNames) {
      const option: HTMLOptionElement = document.createElement("option");
      option.value = itemsName;
      option.text = itemsName;
      frag.appendChild(option);
    }

    items.appendChild(frag);
    this.InitFields();
  }

  protected InitFields(): void {
    if(!this.fields) return;

    const fields: HTMLSelectElement = this.fields.nativeElement;
    fields.innerHTML = "";

    const itemsName: string = this.items.nativeElement.value;
    const item: any = Controller.items.find((entry: any) => entry.class.itemsName === itemsName);
    if(!item) return;

    const frag: DocumentFragment = document.createDocumentFragment();
    for(const field of item.class.searchFields) {
      const option: HTMLOptionElement = document.createElement("option");
      option.value = field;
      option.text = field;
      frag.appendChild(option);
    }

    fields.appendChild(frag);
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.InitBUs();
  }
}
