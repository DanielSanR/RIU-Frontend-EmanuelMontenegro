import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { EditComponent } from '../edit/edit.component';
import { HeroService } from '@core/services/hero.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Hero } from '@shared/models/hero.models';
import { Location } from '@angular/common';

const HERO_MOCK: Hero = {
  id: '1',
  superhero: 'Batman',
  description: 'El caballero oscuro de Ciudad Gótica',
};

describe('EditComponent', () => {
  let component: EditComponent;
  let fixture: ComponentFixture<EditComponent>;
  let mockHeroService: jasmine.SpyObj<HeroService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<SpinnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    mockHeroService = jasmine.createSpyObj('HeroService', [
      'getHeroById',
      'updateHero',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', [
      'error',
      'success',
      'warning',
      'info', 
    ]);
    mockSpinner = jasmine.createSpyObj('SpinnerService', ['show', 'hide'], {
      loading$: false,
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [EditComponent, ReactiveFormsModule],
      providers: [
        { provide: HeroService, useValue: mockHeroService },
        { provide: SpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => HERO_MOCK.id,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    
    mockHeroService.getHeroById.and.returnValue(of(HERO_MOCK));
    mockHeroService.updateHero.and.returnValue(of(HERO_MOCK));
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario en ngOnInit y obtener datos del héroe', fakeAsync(() => {
    mockHeroService.getHeroById.and.returnValue(of(HERO_MOCK));
    component.ngOnInit();
    tick();

    expect(mockSpinner.show).toHaveBeenCalled();
    expect(mockHeroService.getHeroById).toHaveBeenCalledWith(HERO_MOCK.id);
    expect(component.heroForm.value.superhero).toBe(HERO_MOCK.superhero);
    expect(mockSpinner.hide).toHaveBeenCalled();
  }));

  it('debería mostrar mensaje de error si no se encuentra el héroe', fakeAsync(() => {
    mockHeroService.getHeroById.and.returnValue(throwError(() => 'error'));
    component.ngOnInit();
    tick();

    expect(mockToastr.error).toHaveBeenCalledWith(
      'No se encontró el héroe',
      'Error'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/hero/list']);
    expect(mockSpinner.hide).toHaveBeenCalled();
  }));

  it('debería ejecutar updateHero al enviar formulario válido', () => {
    component.heroForm.setValue({
      id: HERO_MOCK.id,
      superhero: HERO_MOCK.superhero,
      description: HERO_MOCK.description,
    });

    mockHeroService.updateHero.and.returnValue(of(HERO_MOCK));
    component.onSubmit();

    expect(mockSpinner.show).toHaveBeenCalled();
    expect(mockHeroService.updateHero).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: HERO_MOCK.id,
        superhero: HERO_MOCK.superhero,
        description: HERO_MOCK.description,
      })
    );
    expect(mockToastr.success).toHaveBeenCalledWith(
      'Héroe actualizado con éxito',
      'Éxito'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/hero/list']);
  });

  it('no debería enviar si el formulario es inválido', () => {
    component.initForm();
    component.heroForm.patchValue({ superhero: '', description: '' });

    component.onSubmit();

    expect(mockToastr.info).toHaveBeenCalledWith(
      'Debe corregir los errores en el formulario.',
      'Atención'
    );
    expect(mockHeroService.updateHero).not.toHaveBeenCalled();
  });

  it('debería mostrar mensaje de error si updateHero falla', () => {
    component.heroForm.setValue({
      id: HERO_MOCK.id,
      superhero: HERO_MOCK.superhero,
      description: HERO_MOCK.description,
    });

    mockHeroService.updateHero.and.returnValue(throwError(() => 'error'));
    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith(
      'Error al actualizar el héroe: error',
      'Error'
    );
    expect(mockSpinner.hide).toHaveBeenCalled();
  });

  it('debería cancelar y navegar de regreso al listado', () => {
    component.cancelar();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/hero/list']);
  });

  it('debería prevenir caracteres inválidos en onPaste', () => {
    const event = {
      clipboardData: {
        getData: () => '&&&&&&&',
      },
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as ClipboardEvent;

    component.onPaste(event, 'superhero');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockToastr.warning).toHaveBeenCalledWith(
      'El contenido pegado en el campo "superhero" contiene caracteres inválidos.',
      'Advertencia'
    );
  });

  it('debería bloquear letras inválidas en onlyLetters', () => {
    const event = {
      key: '1',
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent;

    component.onlyLetters(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
