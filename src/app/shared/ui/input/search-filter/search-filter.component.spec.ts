import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFilterComponent } from './search-filter.component';
import { ToastrService } from 'ngx-toastr';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    toastrSpy = jasmine.createSpyObj('ToastrService', ['warning', 'info']);

    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent],
      providers: [{ provide: ToastrService, useValue: toastrSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir el cambio cuando se selecciona un filtro', () => {
    spyOn(component.selectedOptionChange, 'emit');
    component.onSelectChange('name');
    expect(component.selectedOptionChange.emit).toHaveBeenCalledWith('name');
  });

  it('debería mostrar advertencia si no se selecciona filtro al aplicar', () => {
    component.searchText.set('Batman');
    component.applyFilter();
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      'Seleccioná un tipo de búsqueda primero.',
      'Atención',
      { timeOut: 5000 }
    );
  });

  it('debería mostrar advertencia si el campo de búsqueda está vacío', () => {
    component.selectedOption.set('name');
    component.searchText.set('');
    component.applyFilter();
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      'Por favor, completá el campo de búsqueda.',
      'Atención',
      { timeOut: 5000 }
    );
  });

  it('debería bloquear números si se selecciona filtro por nombre o parámetro', () => {
    component.selectedOption.set('parameter');
    const event = new KeyboardEvent('keypress', { key: '5' });
    spyOn(event, 'preventDefault');
    component.onKeyPress(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(toastrSpy.info).toHaveBeenCalled();
  });

  it('debería bloquear letras si se selecciona filtro por ID', () => {
    component.selectedOption.set('id');
    const event = new KeyboardEvent('keypress', { key: 'a' });
    spyOn(event, 'preventDefault');
    component.onKeyPress(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(toastrSpy.info).toHaveBeenCalled();
  });

  it('debería mostrar info si el ID no es válido', () => {
    component.selectedOption.set('id');
    component.searchText.set('abc');
    component.applyFilter();
    expect(toastrSpy.info).toHaveBeenCalledWith(
      'El ID debe ser un número positivo.',
      'Información'
    );
  });

  it('debería emitir evento si todos los datos están correctos', () => {
    spyOn(component.filterApplied, 'emit');
    component.selectedOption.set('name');
    component.searchText.set('Batman');
    component.applyFilter();
    expect(component.filterApplied.emit).toHaveBeenCalledWith('Batman');
  });

  it('debería limpiar todos los campos y emitir evento de limpieza', () => {
    spyOn(component.clear, 'emit');
    component.selectedOption.set('id');
    component.searchText.set('123');
    component.selectedSecondaryOption.set('X');
    component.clearSearch();

    expect(component.selectedOption()).toBe('');
    expect(component.searchText()).toBe('');
    expect(component.selectedSecondaryOption()).toBe('');
    expect(component.clear.emit).toHaveBeenCalled();
  });
});
