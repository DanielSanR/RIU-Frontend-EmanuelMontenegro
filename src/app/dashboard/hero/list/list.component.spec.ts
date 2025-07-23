import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { HeroService } from '@core/services/hero.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Hero } from '@shared/models/hero.models';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let heroServiceMock: jasmine.SpyObj<HeroService>;
  let toastrMock: jasmine.SpyObj<ToastrService>;
  let routerMock: jasmine.SpyObj<Router>;

  const HEROES: Hero[] = [
    { id: '1', superhero: 'Batman', description: 'Detective', comic: 'DC' },
    { id: '2', superhero: 'Spiderman', description: 'Araña', comic: 'Marvel' },
  ];

  const fakeDialogRef: Partial<MatDialogRef<unknown>> = {
    afterClosed: () => of(true),
    close: () => {},
  };

  beforeEach(async () => {
    heroServiceMock = jasmine.createSpyObj('HeroService', [
      'getHeroes',
      'deleteHero',
      'getHeroById',
    ]);
    heroServiceMock.getHeroes.and.returnValue(of(HEROES));
    heroServiceMock.deleteHero.and.returnValue(of(void 0));
    heroServiceMock.getHeroById.and.returnValue(of(HEROES[0]));

    toastrMock = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    spyOn(MatDialog.prototype, 'open').and.returnValue(
      fakeDialogRef as MatDialogRef<unknown>
    );

    await TestBed.configureTestingModule({
      imports: [ListComponent, NoopAnimationsModule, MatDialogModule],
      providers: [
        { provide: HeroService, useValue: heroServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    component.heroes = [...HEROES];
    component.filteredHeroes = [...HEROES];
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar héroes correctamente', () => {
    heroServiceMock.getHeroes.and.returnValue(of(HEROES));
    component.loadHeroes();
    expect(component.heroes.length).toBe(2);
    expect(component.dataSource.data.length).toBe(2);
    expect(toastrMock.error).not.toHaveBeenCalled();
  });

  it('debería mostrar error si falla la carga de héroes', () => {
    heroServiceMock.getHeroes.and.returnValue(throwError(() => 'error'));
    component.loadHeroes();
    expect(toastrMock.error).toHaveBeenCalledWith(
      'No se pudieron cargar los héroes',
      'Error'
    );
  });

  it('debería navegar al agregar héroe', () => {
    component.addHero();
    expect(routerMock.navigate).toHaveBeenCalledWith(['hero/add']);
  });

  it('debería navegar al editar héroe', () => {
    component.editHero(HEROES[0]);
    expect(routerMock.navigate).toHaveBeenCalledWith(['hero/edit', '1']);
  });

  it('debería abrir el preview del héroe', () => {
    component.openPreview(HEROES[0]);
    expect(MatDialog.prototype.open).toHaveBeenCalled();
  });

  it('debería eliminar un héroe después de confirmar', () => {
    spyOn(component, 'loadHeroes');
    component.deleteHero(HEROES[0]);
    expect(heroServiceMock.deleteHero).toHaveBeenCalledWith('1');
    expect(toastrMock.success).toHaveBeenCalled();
    expect(component.loadHeroes).toHaveBeenCalled();
  });

  it('debería mostrar error si falla al eliminar', () => {
    heroServiceMock.deleteHero.and.returnValue(throwError(() => 'error'));
    component.deleteHero(HEROES[0]);
    expect(toastrMock.error).toHaveBeenCalledWith(
      'No se pudo eliminar el héroe. Intente más tarde.',
      'Error'
    );
  });

  it('no debería eliminar si no se confirma el diálogo', () => {
    (MatDialog.prototype.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(false),
      close: () => {},
    } as any);
    component.deleteHero(HEROES[0]);
    expect(heroServiceMock.deleteHero).not.toHaveBeenCalled();
  });

  it('debería advertir si no se selecciona opción de filtro', () => {
    component.selectedOption = '';
    component.onFilterApplied('algo');
    expect(toastrMock.warning).toHaveBeenCalledWith(
      'Seleccioná un tipo de búsqueda primero.',
      'Atención'
    );
  });

  it('debería filtrar por nombre exacto y encontrar', () => {
    component.selectedOption = 'name';
    component.heroes = HEROES;
    component.onFilterApplied('Batman');
    expect(component.filteredHeroes.length).toBe(1);
  });

  it('debería advertir si no hay héroe con ese nombre', () => {
    component.selectedOption = 'name';
    component.heroes = HEROES;
    component.onFilterApplied('NoExiste');
    expect(toastrMock.warning).toHaveBeenCalledWith(
      'No se encontraron héroes con ese nombre.',
      'Sin resultados'
    );
  });

  it('debería filtrar por parámetro y encontrar', () => {
    component.selectedOption = 'parameter';
    component.heroes = HEROES;
    component.onFilterApplied('man');
    expect(component.filteredHeroes.length).toBe(2);
  });

  it('debería advertir si no hay coincidencias de parámetro', () => {
    component.selectedOption = 'parameter';
    component.heroes = HEROES;
    component.onFilterApplied('ZZZZ');
    expect(toastrMock.warning).toHaveBeenCalledWith(
      'Ningún héroe coincide con ese texto.',
      'Sin Coincidencias'
    );
  });

  it('debería advertir si ID no es válido', () => {
    component.selectedOption = 'id';
    component.heroes = HEROES;
    component.onFilterApplied('abc');
    expect(toastrMock.warning).toHaveBeenCalledWith(
      'Ingresá un ID válido (número positivo).',
      'Atención'
    );
  });

  it('debería filtrar por id correctamente', () => {
    component.selectedOption = 'id';
    component.heroes = HEROES;
    heroServiceMock.getHeroById.and.returnValue(of(HEROES[0]));
    component.onFilterApplied('1');
    expect(component.filteredHeroes.length).toBe(1);
  });

  it('debería mostrar error si no existe héroe con id', () => {
    component.selectedOption = 'id';
    component.heroes = HEROES;
    heroServiceMock.getHeroById.and.returnValue(throwError(() => 'error'));
    component.onFilterApplied('999');
    expect(toastrMock.error).toHaveBeenCalledWith(
      'No existe un héroe con el número ingresado.',
      'Error'
    );
  });

  it('debería limpiar filtros y recargar héroes', () => {
    spyOn(component, 'loadHeroes');
    component.selectedOption = 'id';
    component.clearInputs();
    expect(component.selectedOption).toBe('');
    expect(component.loadHeroes).toHaveBeenCalled();
  });

  it('debería actualizar paginación en desktop', () => {
    spyOn(component, 'isMobile').and.returnValue(false);
    component.filteredHeroes = HEROES;
    component.onPageChange({ pageIndex: 1, pageSize: 1, length: 2 });
    expect(component.dataSource.data.length).toBe(2);
  });

  it('debería actualizar paginación en mobile', () => {
    spyOn(component, 'isMobile').and.returnValue(true);
    component.filteredHeroes = HEROES;
    component.onPageChange({ pageIndex: 1, pageSize: 1, length: 2 });
    expect(component.dataSource.data.length).toBe(1);
  });
});
