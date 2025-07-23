import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHeroComponent } from './card-hero.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('CardHeroComponent', () => {
  let component: CardHeroComponent;
  let fixture: ComponentFixture<CardHeroComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CardHeroComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CardHeroComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            name: 'Spiderman',
            description: 'Héroe arácnido',
            image: 'spiderman.jpg',
          },
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería recibir los datos del héroe por inyección', () => {
    expect(component.data.name).toBe('Spiderman');
    expect(component.data.description).toBe('Héroe arácnido');
    expect(component.data.image).toBe('spiderman.jpg');
  });

  it('debería cerrar el diálogo al llamar al método close()', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
