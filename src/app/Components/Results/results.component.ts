import { Component, ElementRef, ViewChild } from "@angular/core";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { NgFor } from "@angular/common";
import { Utility } from "../../Logics/utility";
import { Controller } from "../../Logics/controller";

@Component({
  selector: "app-results",
  imports: [MatTableModule, MatPaginator, MatPaginatorModule, MatSort, MatSortModule, NgFor],
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.css"
})

export class ResultsComponent {
  @ViewChild("results", {read: ElementRef})
  private readonly results!: ElementRef<HTMLTableElement>;

  @ViewChild(MatSort)
  private readonly sort!: MatSort;

  @ViewChild(MatPaginator)
  private readonly paginator!: MatPaginator;

  private readonly sep: string = ",";
  public headers!: string[];
  public dataSource!: MatTableDataSource<any, MatPaginator>;
  public showPaginator: boolean = false;

  public async Export(): Promise<void> {
    const table: HTMLTableElement = this.results.nativeElement;
    if(table.rows.length === 0) return;

    const sv: string[][] = [];
    for(const tableRow of table.rows) {
      const row: string[] = [];
      for(const tableCell of tableRow.cells) row.push(tableCell.innerText);
      sv.push(row);
    }

    const data: string = sv.map((row: string[]) => row.join(this.sep)).join("\n");
    const itemsName: string = table.rows[0].cells[0].innerText;
    await Utility.Output("sv", data, true, "", itemsName);
  }

  public Populate(results: any): void {
    if(!Array.isArray(results)) return;
    if(this.dataSource) this.dataSource.data = [];
    if(results.length === 0) return;

    const type: string = results[0].Type;
    const item: any = Controller.items.find((entry: any) => entry.class.type === type);
    if(!item) return;
    this.headers = [type].concat(item.class.tableFields);

    let n: number = 1;
    for(const result of results) {
      for(const field of Object.keys(result)) {
        if(!this.headers.includes(field)) delete result[field];
      }
      result[type] = n++;
    }

    this.dataSource = new MatTableDataSource(results);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.showPaginator = true;
  }
}