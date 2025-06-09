import { Component, ElementRef, ViewChild } from "@angular/core";
import { InputComponent } from "../Input/input.component";
import { Controller } from "../../Logics/controller";

@Component({
  selector: "app-search",
  imports: [],
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.css"
})

export class SearchComponent extends InputComponent {
  @ViewChild("pattern")
  private readonly pattern!: ElementRef;

  @ViewChild("query")
  private readonly query!: ElementRef;

  @ViewChild("usequery")
  private readonly useQuery!: ElementRef;

  @ViewChild("isregex")
  private readonly isRegex!: ElementRef;

  @ViewChild("caseins")
  private readonly caseIns!: ElementRef;

  @ViewChild("search")
  private readonly search!: ElementRef;

  public showQuery: boolean = false;

  protected async OnChange(ev: Event): Promise<void> {
    const select: HTMLSelectElement = ev.target as HTMLSelectElement;
    switch(select) {
      case this.BUs.nativeElement:
        this.UpdateQuery(select);
        await this.InitItems();
        break;

      case this.items.nativeElement:
        this.UpdateQuery(select);
        this.InitFields();
        break;

      case this.fields.nativeElement:
        this.UpdateQuery(select);
        break;
    }
  }

  protected UpdateQuery(select: HTMLSelectElement): void {
    if(!this.useQuery.nativeElement.checked) return;

    const queryArea: HTMLTextAreaElement = this.query.nativeElement;
    const query: string = queryArea.value;
    const pos: number = queryArea.selectionStart;

    queryArea.value = `${query.substring(0, pos)}${select.value}${query.substring(pos)}`;
  }

  protected InitQuery(): void {
    this.showQuery = !this.showQuery;
  }

  protected async Search(): Promise<void> {
    const button: HTMLButtonElement = this.search.nativeElement;
    const text: string = button.innerText;
    button.innerText += "ing...";
    button.disabled = true;

    try {
      this.emitter.emit(await Controller.Process({
        actionName: "search",
        BUid: this.BUs.nativeElement.value,
        itemsName: this.items.nativeElement.value,
        field: this.fields.nativeElement.value,
        pattern: this.pattern?.nativeElement.value,
        query: this.query?.nativeElement.value,
        useQuery: this.useQuery.nativeElement.checked,
        isRegex: this.isRegex.nativeElement.checked,
        caseIns: this.caseIns.nativeElement.checked
      }));
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