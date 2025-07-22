import { Component, inject, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HeroService } from '@core/services/hero.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private heroService = inject(HeroService);
  private toastr = inject(ToastrService);
  private spinner = inject(SpinnerService);

  instrucciones = [
    'Los campos marcados con <span class="req">*</span> son obligatorios.',
  ];

  heroForm: FormGroup = this.fb.group({
    id: [{ value: '', disabled: true }],
    superhero: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']+$/),
        this.antiSpamValidator('superhero'),
      ],
    ],
    comic: [{ value: '', disabled: true }],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-'\.,]+$/),
        this.antiSpamValidator('description'),
      ],
    ],
  });

  isLoading = false;
  formError = '';
  nextId: number = 1;

  constructor() {
    this.setNextHeroId();
    this.heroForm.get('comic')?.setValue('default');
  }

  private setNextHeroId(): void {
    this.heroService.getHeroes().subscribe((heroes) => {
      const highestId = Math.max(...heroes.map((h) => +h.id), 0);
      this.nextId = highestId + 1;
      this.heroForm.patchValue({ id: String(this.nextId) });
    });
  }

  onlyLetters(event: KeyboardEvent) {
    const char = event.key;
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-'\.,]$/.test(char)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent, controlName: string) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const pastedText = clipboardData.getData('text');

    if (!this.checkNotSpam(pastedText) || /[0-9]/.test(pastedText)) {
      event.preventDefault();
      this.toastr.error('No se permite pegar texto inválido.', 'Error');
      this.heroForm.get(controlName)?.setErrors({ spam: true });
      this.heroForm.get(controlName)?.markAsTouched();
    }
  }

  antiSpamValidator(controlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = (control.value || '').trim().toLowerCase();
      if (!value) return null;

      if (
        /^(.)\1{3,}$/.test(value) ||
        /(asdasd|jajaja|qwerty|zzz|xxx|lol|test)/.test(value)
      ) {
        return { spam: true };
      }
      const unique = Array.from(
        new Set(value.replace(/[^a-záéíóúüñ]/gi, '').split(''))
      );
      if (unique.length <= 3) {
        return { spam: true };
      }
      if (/(.{2,5})\1{2,}/.test(value)) {
        return { spam: true };
      }
      return null;
    };
  }
  checkNotSpam(text: string): boolean {
    if (!text) return true;
    text = text.trim().toLowerCase();
    if (
      /^(.)\1{3,}$/.test(text) ||
      /(asdasd|jajaja|qwerty|zzz|xxx|lol|test)/.test(text)
    )
      return false;
    const unique = Array.from(
      new Set(text.replace(/[^a-záéíóúüñ]/gi, '').split(''))
    );
    if (unique.length <= 3) return false;
    if (/(.{2,5})\1{2,}/.test(text)) return false;
    return true;
  }

  onSubmit(): void {
    this.formError = '';
    if (this.heroForm.invalid) {
      this.markAllAsTouched();
      if (
        this.heroForm.get('superhero')?.errors?.['spam'] ||
        this.heroForm.get('description')?.errors?.['spam']
      ) {
        this.formError =
          'No se permiten cadenas repetidas ni palabras sin sentido.';
      } else {
        this.formError = 'Por favor completa todos los campos correctamente.';
      }
      return;
    }

    this.spinner.show();
    this.heroForm.get('comic')?.enable();

    const heroData = this.heroForm.getRawValue();

    this.heroService.addHero(heroData).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Héroe agregado exitosamente', 'Éxito');
        this.router.navigate(['/dashboard/list-heroes']);
      },
      error: () => {
        this.spinner.hide();
        this.formError = 'No se pudo agregar el héroe. Intenta más tarde.';
      },
    });

    this.heroForm.get('comic')?.disable();
    this.setNextHeroId();
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/list-heroes']);
  }

  private markAllAsTouched() {
    Object.values(this.heroForm.controls).forEach((c) => c.markAsTouched());
  }
}
