import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-card-hero',
  templateUrl: './card-hero.component.html',
  styleUrls: ['./card-hero.component.scss'],
  standalone: true,
  imports: [MatIcon],
})
export class CardHeroComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { image: string; name: string; description: string },
    private dialogRef: MatDialogRef<CardHeroComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
