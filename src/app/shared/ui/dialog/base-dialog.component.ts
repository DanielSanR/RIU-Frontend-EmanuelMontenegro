import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
})
export class BaseDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: 'preview' | 'confirm';
      image?: string;
      name?: string;
      message?: string;
    },
    private dialogRef: MatDialogRef<BaseDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
