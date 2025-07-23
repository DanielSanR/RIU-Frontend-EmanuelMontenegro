import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { EditComponent } from './edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HeroService } from '@core/services/hero.service';
import { SpinnerService } from '@core/services/spinner.service';
import { of, throwError } from 'rxjs';

const fakeActivatedRoute = {
  snapshot: {
    paramMap: convertToParamMap({ id: '1' }),
  },
};

describe('EditComponent mínimo funcional', () => {
  let component: EditComponent;
  let fixture: ComponentFixture<EditComponent>;
  let heroServiceSpy: jasmine.SpyObj<HeroService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let spinnerSpy: jasmine.SpyObj<SpinnerService>;

  const mockHero = {
    id: '1',
    superhero: 'Spiderman',
    description: 'Lanza telarañas desde sus muñecas',
  };

  beforeEach(() => {
    heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'getHeroById',
      'updateHero',
    ]);
    heroServiceSpy.getHeroById.and.returnValue(of(mockHero));
    heroServiceSpy.updateHero.and.returnValue(of(mockHero));

    toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    spinnerSpy = jasmine.createSpyObj('SpinnerService', ['show', 'hide']);

    TestBed.configureTestingModule({
      imports: [EditComponent, ReactiveFormsModule],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SpinnerService, useValue: spinnerSpy },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
  });

  it('should create and load hero', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
    expect(heroServiceSpy.getHeroById).toHaveBeenCalledWith('1');
    expect(component.heroForm.value.superhero).toBe('Spiderman');
  }));

  it('debería crear el componente y cargar héroe', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
    expect(heroServiceSpy.getHeroById).toHaveBeenCalledWith('1');
    expect(component.heroForm.value.superhero).toBe('Spiderman');
    expect(spinnerSpy.show).toHaveBeenCalled();
    expect(spinnerSpy.hide).toHaveBeenCalled();
  }));

  it('no debería enviar si el formulario es inválido', () => {
    component.initForm();
    component.heroForm.setErrors({ invalid: true });
    component.onSubmit();

    expect(toastrSpy.info).toHaveBeenCalledWith(
      'Debe corregir los errores en el formulario.',
      'Atención'
    );
    expect(heroServiceSpy.getHeroById).not.toHaveBeenCalled();
    expect(heroServiceSpy.updateHero).not.toHaveBeenCalled();
  });

  it('debería ejecutar updateHero al enviar formulario válido', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.heroForm.setValue({
      id: '1',
      superhero: 'Spiderman',
      description: 'Lanza telarañas desde sus muñecas',
    });

    component.onSubmit();
    tick();

    expect(heroServiceSpy.getHeroById).toHaveBeenCalledWith('1');
    expect(heroServiceSpy.updateHero).toHaveBeenCalledWith(
      jasmine.objectContaining({
        superhero: 'Spiderman',
        description: 'Lanza telarañas desde sus muñecas',
        id: '1',
      })
    );
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Héroe actualizado con éxito',
      'Éxito'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/hero/list']);
  }));

  it('debería mostrar error si updateHero falla', fakeAsync(() => {
    heroServiceSpy.updateHero.and.returnValue(
      throwError(() => 'Error actualización')
    );
    fixture.detectChanges();
    tick();

    component.heroForm.setValue({
      id: '1',
      superhero: 'Spiderman',
      description: 'Lanza telarañas desde sus muñecas',
    });

    component.onSubmit();
    tick();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Error al actualizar el héroe: Error actualización',
      'Error'
    );
    expect(spinnerSpy.hide).toHaveBeenCalled();
  }));

  it('debería mostrar error si getHeroById falla en onSubmit', fakeAsync(() => {
    heroServiceSpy.getHeroById.and.returnValue(
      throwError(() => 'Error getHeroById')
    );
    fixture.detectChanges();
    tick();

    component.heroForm.setValue({
      id: '1',
      superhero: 'Spiderman',
      description: 'Lanza telarañas desde sus muñecas',
    });

    component.onSubmit();
    tick();

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'No se encontró el héroe para actualizar',
      'Error'
    );
    expect(spinnerSpy.hide).toHaveBeenCalled();
  }));
});
