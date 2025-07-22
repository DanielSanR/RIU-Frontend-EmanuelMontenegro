import { Component, signal, input, output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
})
export class SearchFilterComponent {
  primaryPlaceholder = input<string>('Seleccione un Filtro');
  secondaryPlaceholder = input<string>('Buscando');
  options = input<Array<{ value: string; label: string }>>([]);
  useMatSelect = input<boolean>(false);
  secondaryOptions = input<string[]>([]);

  filterApplied = output<string>();
  selectedOptionChange = output<string>();
  clear = output<void>();

  selectedOption = signal('');
  selectedSecondaryOption = signal('');
  searchText = signal('');

  constructor(private toastr: ToastrService) {}

  private toastTime = { timeOut: 5000 };

  onSelectChange(value: string) {
    this.selectedOption.set(value);
    this.selectedOptionChange.emit(value);
  }

  clearSearch(): void {
    this.selectedOption.set('');
    this.selectedSecondaryOption.set('');
    this.searchText.set('');
    this.clear.emit();
  }

  applyFilter() {
    const filter = this.selectedOption();
    const text = this.searchText().trim();

    if (!filter) {
      this.toastr.warning(
        'Seleccioná un tipo de búsqueda primero.',
        'Atención',
        this.toastTime
      );
      return;
    }

    if (!text) {
      this.toastr.warning(
        'Por favor, completá el campo de búsqueda.',
        'Atención',
        this.toastTime
      );
      return;
    }

    if ((filter === 'name' || filter === 'parameter') && /\d/.test(text)) {
      this.toastr.info(
        'No se permiten números en este tipo de búsqueda.',
        'Información',
        this.toastTime
      );
      return;
    }

    if (filter === 'id' && (!/^\d+$/.test(text) || Number(text) <= 0)) {
      this.toastr.info('El ID debe ser un número positivo.', 'Información');
      return;
    }

    this.filterApplied.emit(text);
  }

  onInputChange(value: string) {
    this.searchText.set(value);
  }

  onKeyPress(event: KeyboardEvent) {
    const filter = this.selectedOption();
    const key = event.key;

    const isNumber = /\d/.test(key);
    const isLetter = /[a-zA-Z]/.test(key);

    if ((filter === 'name' || filter === 'parameter') && isNumber) {
      event.preventDefault();
      this.toastr.info(
        'No se permiten números para este tipo de búsqueda.',
        'Información',
        this.toastTime
      );
    }

    if (filter === 'id' && isLetter) {
      event.preventDefault();
      this.toastr.info(
        'Solo se permiten números en la búsqueda por ID.',
        'Información',
        this.toastTime
      );
    }
  }
}
