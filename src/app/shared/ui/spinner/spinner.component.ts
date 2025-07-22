import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SpinnerService } from '@core/services/spinner.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  private spinnerSignal = inject(SpinnerService).loading$;
  private ngxSpinner = inject(NgxSpinnerService);

  constructor() {
    effect(() => {
      if (this.spinnerSignal()) {
        this.ngxSpinner.show();
      } else {
        this.ngxSpinner.hide();
      }
    });
  }
}
