import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeroService } from '@core/services/hero.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-hero',
  standalone: true,
  imports: [ReactiveFormsModule],  
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddHeroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private heroService = inject(HeroService);
  private toastr = inject(ToastrService);

  heroForm: FormGroup = this.fb.group({
    id: [{ value: '22', disabled: true }],
    superhero: ['', Validators.required],
    comic: [{ value: 'marvel-bop', disabled: true }],
    description: ['', [Validators.required, Validators.maxLength(100)]],
  });

  nextId: number = 22;

  constructor() {
    this.setNextHeroId();
    this.applyUppercaseTransform();
  }

  private setNextHeroId(): void {
    this.heroService.getHeroes().subscribe((heroes) => {
      const highestId = Math.max(...heroes.map((h) => +h.id));
      this.nextId = highestId + 1;
      this.heroForm.patchValue({ id: String(this.nextId) });
    });
  }

  private applyUppercaseTransform(): void {
    ['superhero', 'description'].forEach((field) => {
      const control = this.heroForm.get(field);
      control?.valueChanges.subscribe((value) => {
        if (value && value !== value.toUpperCase()) {
          control.setValue(value.toUpperCase(), { emitEvent: false });
        }
      });
    });
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    this.heroForm.get('comic')?.enable();
    const heroData = this.heroForm.getRawValue();

    this.heroService.addHero(heroData).subscribe({
      next: () => {
        this.toastr.success('Héroe agregado exitosamente', 'Éxito');
        this.router.navigate(['/dashboard/list-heroes']);
      },
      error: () => {
        this.toastr.error('No se pudo agregar el héroe', 'Error');
      },
    });

    this.heroForm.get('comic')?.disable();
    this.setNextHeroId();
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/list-heroes']);
  }
}
