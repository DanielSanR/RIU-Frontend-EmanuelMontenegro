import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ToastrService } from 'ngx-toastr';
import { HeroService } from '@core/services/hero.service';
import { Hero } from '@shared/models/hero.models';
import { SpinnerService } from '@core/services/spinner.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
  ],
})
export class EditComponent implements OnInit {
  heroForm!: FormGroup;

  private spinner = inject(SpinnerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private heroService = inject(HeroService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  instrucciones = [
    `Solo se pueden editar los campos: <strong>Nombre</strong> y <strong>Descripción</strong><span class="req">*</span>.`,
  ];

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastr.error('No se recibió ID del héroe', 'Error');
      this.router.navigate(['/dashboard/list-hero']);
      return;
    }

    this.spinner.show();
    this.heroService.getHeroById(id).subscribe({
      next: (hero: Hero) => {
        this.heroForm.patchValue(hero);
        this.spinner.hide();
      },
      error: () => {
        this.toastr.error('No se encontró el héroe', 'Error');
        this.router.navigate(['/dashboard/list-hero']);
        this.spinner.hide();
      },
    });
  }

  get isLoading(): boolean {
    return this.spinner.loading$();
  }

  initForm(): void {
    this.heroForm = this.fb.group({
      id: [''],
      superhero: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
          this.noSpamValidator(),
        ],
      ],
      comic: ['', [Validators.required, Validators.maxLength(30)]],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:'"()!?¡¿-]*$/),
          this.noSpamValidator(),
        ],
      ],
    });
  }

  noSpamValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const repeated = /(.)\1{3,}/.test(value);
      const nonsense = /^([a-zA-Z])\1+$/.test(value);
      return repeated || nonsense ? { spam: true } : null;
    };
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    const heroData = {
      ...this.heroForm.getRawValue(),
      id: this.route.snapshot.paramMap.get('id') || '',
    };

    this.spinner.show();

    this.heroService.updateHero(heroData).subscribe({
      next: () => {
        this.toastr.success('Héroe actualizado con éxito', '✅ Éxito');
        this.router.navigate(['/dashboard/list-hero']);
      },
      error: (err) => {
        this.toastr.error(`Error al actualizar el héroe: ${err}`, '❌ Error');
      },
      complete: () => this.spinner.hide(),
    });
  }

  onlyLetters(event: KeyboardEvent): void {
    const input = event.key;
    const allowed = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
    if (!allowed.test(input)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent, field: string): void {
    const pastedText = event.clipboardData?.getData('text') || '';
    const allowed = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:'"()!?¡¿-]*$/;

    if (!allowed.test(pastedText)) {
      event.preventDefault();
      this.toastr.warning(
        `El contenido pegado en el campo "${field}" contiene caracteres inválidos.`,
        'Advertencia'
      );
    }
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/list-hero']);
  }
}
