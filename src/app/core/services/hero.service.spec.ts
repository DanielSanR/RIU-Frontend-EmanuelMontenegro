import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { ToastrService } from 'ngx-toastr';
import { Hero } from '@shared/models/hero.models';

describe('HeroService', () => {
  let service: HeroService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    TestBed.configureTestingModule({
      providers: [HeroService, { provide: ToastrService, useValue: toastrSpy }],
    });

    service = TestBed.inject(HeroService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería devolver todos los héroes', (done) => {
    service.getHeroes().subscribe((heroes) => {
      expect(heroes.length).toBeGreaterThan(0);
      done();
    });
  });

  it('debería devolver un héroe por su ID', (done) => {
    service.getHeroById('1').subscribe((hero) => {
      expect(hero.superhero).toBe('Batman');
      done();
    });
  });

  it('debería devolver error si el ID del héroe no existe', (done) => {
    service.getHeroById('999').subscribe({
      next: () => {},
      error: (err) => {
        expect(err.message).toContain('no fue encontrado');
        done();
      },
    });
  });

  it('debería buscar héroes por término', (done) => {
    service.searchHeroes('man').subscribe((results) => {
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((h) => h.superhero.toLowerCase().includes('man'))
      ).toBe(true);
      done();
    });
  });

  it('debería agregar un nuevo héroe', (done) => {
    const newHero: Hero = {
      id: '',
      superhero: 'Test Hero',
      description: 'Descripción de test',
      
    };

    service.addHero(newHero).subscribe((hero) => {
      expect(hero.id).toBeDefined();
      expect(hero.superhero).toBe('Test Hero');
      done();
    });
  });

  it('debería actualizar un héroe existente', (done) => {
    const heroToUpdate = { ...service['heroes'][0], superhero: 'Updated Hero' };

    service.updateHero(heroToUpdate).subscribe((updated) => {
      expect(updated.superhero).toBe('Updated Hero');
      done();
    });
  });

  it('debería devolver error si la actualización falla', (done) => {
    const nonExistingHero: Hero = {
      id: '9999',
      superhero: 'Ghost',
      description: '',
      
    };

    service.updateHero(nonExistingHero).subscribe({
      next: () => {},
      error: (err) => {
        expect(err.message).toContain('no encontrado');
        done();
      },
    });
  });

  it('debería eliminar un héroe existente', (done) => {
    const heroId = service['heroes'][0].id;
    service.deleteHero(heroId).subscribe(() => {
      const exists = service['heroes'].some((h) => h.id === heroId);
      expect(exists).toBe(false);
      done();
    });
  });

  it('debería devolver error si la eliminación falla', (done) => {
    service.deleteHero('9999').subscribe({
      next: () => {},
      error: (err) => {
        expect(err.message).toContain('no encontrado');
        done();
      },
    });
  });
});
