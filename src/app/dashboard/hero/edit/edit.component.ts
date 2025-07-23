import { Component, OnInit } from '@angular/core';
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

  constructor(
    private spinner: SpinnerService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private heroService: HeroService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  instrucciones = [
    `Solo se pueden editar los campos: <strong>Nombre</strong> y <strong>Descripción</strong><span class="req">*</span>.`,
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadHero();
  }

  private loadHero(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError('No se recibió ID del héroe');
      return;
    }

    if (!this.heroService?.getHeroById) {
      this.handleError('El servicio getHeroById no está disponible');
      return;
    }

    this.spinner.show();

    try {
      this.heroService.getHeroById(id).subscribe({
        next: (hero) => {
          if (!hero) {
            this.handleError('No se encontró el héroe');
            return;
          }
          this.heroForm.patchValue(hero);
          this.spinner.hide();
        },
        error: () => {
          this.handleError('No se encontró el héroe');
        },
      });
    } catch (e) {}
  }

  private handleError(message: string): void {
    this.toastr.error(message, 'Error');
    this.router.navigate(['/dashboard/hero/list']);
    this.spinner.hide();
  }

  get isLoading$() {
    return this.spinner.loading$;
  }

  initForm(): void {
    this.heroForm = this.fb.group({
      id: [''],
      superhero: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
          this.noSpamValidator(2, 2),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:'"()!?¡¿-]*$/),
          this.noSpamValidator(3, 2),
        ],
      ],
    });
  }

  noSpamValidator(minRepeatLength = 2, maxAllowedRepeats = 2): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').toLowerCase().trim();
      if (!value) return null;
      const len = value.length;
      for (
        let subLen = minRepeatLength;
        subLen <= Math.floor(len / 2);
        subLen++
      ) {
        const substrCount: Record<string, number> = {};
        for (let i = 0; i <= len - subLen; i++) {
          const substr = value.substr(i, subLen);
          substrCount[substr] = (substrCount[substr] || 0) + 1;
          if (substrCount[substr] > maxAllowedRepeats) {
            return { spam: true };
          }
        }
      }

      return null;
    };
  }

  onSubmit(): void {
    if (this.heroForm.invalid) {
      this.toastr.info(
        'Debe corregir los errores en el formulario.',
        'Atención'
      );
      return;
    }

    const id = this.route.snapshot.paramMap.get('id') || '';
    const heroData = { ...this.heroForm.getRawValue(), id };

    this.heroService.getHeroById(id).subscribe({
      next: (originalHero) => {
        if (originalHero) {
          heroData.comic = originalHero.comic;
        }
        this.spinner.show();
        this.heroService.updateHero(heroData).subscribe({
          next: () => {
            this.toastr.success('Héroe actualizado con éxito', 'Éxito');
            this.router.navigate(['/dashboard/hero/list']);
          },
          error: (err) => {
            this.toastr.error(`Error al actualizar el héroe: ${err}`, 'Error');
            this.spinner.hide();
          },
          complete: () => this.spinner.hide(),
        });
      },
      error: () => {
        this.toastr.error('No se encontró el héroe para actualizar', 'Error');
        this.spinner.hide();
      },
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
    this.router.navigate(['/dashboard/hero/list']);
  }
}
