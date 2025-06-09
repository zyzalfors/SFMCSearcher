import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-messagebox',
  imports: [],
  templateUrl: './messagebox.component.html',
  styleUrl: './messagebox.component.css'
})

export class MessageBoxComponent {
  protected readonly message!: string;

  public constructor(private dialogRef: MatDialogRef<MessageBoxComponent>, @Inject(MAT_DIALOG_DATA) msg: any, private el: ElementRef, private rend: Renderer2) {
    this.message = msg.message;
  }

  protected close(): void {
    this.dialogRef.close();
  }

  public ngAfterViewInit(): void {
    const surface: HTMLElement = this.el.nativeElement.closest(".mat-mdc-dialog-surface");
    if(surface) {
      this.rend.setStyle(surface, "border-radius", "6px");
      this.rend.setStyle(surface, "padding", "6px");
    }
  }
}
