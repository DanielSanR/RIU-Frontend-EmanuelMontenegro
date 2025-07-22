import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { ToastrService } from 'ngx-toastr';
import { Hero } from '@shared/models/hero.models';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HeroService,
        {
          provide: ToastrService,
          useValue: {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
          },
        },
      ],
    });

    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all heroes', (done) => {
    service.getHeroes().subscribe((heroes) => {
      expect(heroes.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return hero by ID', (done) => {
    service.getHeroById('1').subscribe((hero) => {
      expect(hero.superhero).toBe('Batman');
      done();
    });
  });

  it('should return error if hero ID does not exist', (done) => {
    service.getHeroById('999').subscribe({
      error: (err) => {
        expect(err.message).toContain('no fue encontrado');
        done();
      },
    });
  });

  it('should search heroes by term', (done) => {
    service.searchHeroes('man').subscribe((results) => {
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((h) => h.superhero.toLowerCase().includes('man'))
      ).toBeTrue();
      done();
    });
  });

  it('should add a new hero', (done) => {
    const newHero: Hero = {
      id: '',
      superhero: 'Test Hero',
      description: 'Descripción de test',
      comic: 'test-comic',
    };

    service.addHero(newHero).subscribe((hero) => {
      expect(hero.id).toBeDefined();
      expect(hero.superhero).toBe('Test Hero');
      done();
    });
  });

  it('should update an existing hero', (done) => {
    const heroToUpdate = { ...service['heroes'][0], superhero: 'Updated Hero' };

    service.updateHero(heroToUpdate).subscribe((updated) => {
      expect(updated.superhero).toBe('Updated Hero');
      done();
    });
  });

  it('should return error if update fails', (done) => {
    const nonExistingHero: Hero = {
      id: '9999',
      superhero: 'Ghost',
      description: '',
      comic: '',
    };

    service.updateHero(nonExistingHero).subscribe({
      error: (err) => {
        expect(err.message).toContain('no encontrado');
        done();
      },
    });
  });

  it('should delete an existing hero', (done) => {
    const heroId = service['heroes'][0].id;
    service.deleteHero(heroId).subscribe(() => {
      const exists = service['heroes'].some((h) => h.id === heroId);
      expect(exists).toBeFalse();
      done();
    });
  });

  it('should return error if delete fails', (done) => {
    service.deleteHero('9999').subscribe({
      error: (err) => {
        expect(err.message).toContain('no encontrado');
        done();
      },
    });
  });
});
