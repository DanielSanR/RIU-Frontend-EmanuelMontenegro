import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let mockNgxSpinnerService: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockNgxSpinnerService = jasmine.createSpyObj('NgxSpinnerService', [
      'show',
      'hide',
      'getSpinner',
    ]);

    const fakeSpinner = {
      show: false,
      name: 'primary',
      showSpinner: false,
    };

    mockNgxSpinnerService.getSpinner.and.returnValue(of(fakeSpinner as any));
    mockNgxSpinnerService.show.and.returnValue(Promise.resolve());
    mockNgxSpinnerService.hide.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [
        { provide: NgxSpinnerService, useValue: mockNgxSpinnerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería ocultar el spinner si loading$ está en false', () => {
    expect(mockNgxSpinnerService.getSpinner).toHaveBeenCalledWith('primary');
    expect(mockNgxSpinnerService.hide).toHaveBeenCalled();
  });
});
