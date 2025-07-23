import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseDialogComponent } from './base-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('BaseDialogComponent', () => {
  let component: BaseDialogComponent;
  let fixture: ComponentFixture<BaseDialogComponent>;
  let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<BaseDialogComponent>>;

  beforeEach(async () => {
    matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [BaseDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            type: 'confirm',
            name: 'Spiderman',
            message: '¿Estás seguro de eliminar?',
          },
        },
        { provide: MatDialogRef, useValue: matDialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cerrar el diálogo al hacer click en Cancelar', () => {
    const cancelButton = fixture.nativeElement.querySelector('.btn-cancel');
    cancelButton.click();
    expect(matDialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('debería confirmar al hacer click en Eliminar', () => {
    const confirmButton = fixture.nativeElement.querySelector('.btn-confirm');
    confirmButton.click();
    expect(matDialogRefSpy.close).toHaveBeenCalledWith(true);
  });
});
