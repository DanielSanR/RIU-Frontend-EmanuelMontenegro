import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { Hero } from '@shared/models/hero.models';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private heroes: Hero[] = [
    {
      id: '1',
      superhero: 'Batman',
      description:
        'Batman combina inteligencia, artes marciales y tecnología avanzada para proteger Gotham City.',
      comic: 'dc-batman',
    },
    {
      id: '2',
      superhero: 'Superman',
      description:
        'Superman posee fuerza sobrehumana, vuelo y visión láser, luchando siempre por la justicia mundial.',
      comic: 'dc-superman',
    },
    {
      id: '3',
      superhero: 'Flash',
      description:
        'Flash se mueve a velocidades increíbles, viaja en el tiempo y atraviesa objetos sólidos sin esfuerzo.',
      comic: 'dc-flash',
    },
    {
      id: '4',
      superhero: 'Green Lantern',
      description:
        'Green Lantern usa un anillo de poder que crea energía y construcciones para defender el universo.',
      comic: 'dc-greenlantern',
    },
    {
      id: '5',
      superhero: 'Green Arrow',
      description:
        'Green Arrow es un arquero experto, usa flechas especiales y estrategia para combatir la injusticia.',
      comic: 'dc-greenarrow',
    },
    {
      id: '6',
      superhero: 'Wonder Woman',
      description:
        'Wonder Woman es fuerte, ágil y utiliza el Lazo de la Verdad y brazaletes mágicos en combate.',
      comic: 'dc-wonderwoman',
    },
    {
      id: '7',
      superhero: 'Iron Man',
      description:
        'Iron Man usa una armadura tecnológica capaz de volar, disparar rayos y resistir enormes daños.',
      comic: 'marvel-ironman',
    },
    {
      id: '8',
      superhero: 'Loki',
      description:
        'Loki domina magia y engaño, creando ilusiones y estrategias para manipular a sus oponentes.',
      comic: 'marvel-loki',
    },
    {
      id: '9',
      superhero: 'Capitán América',
      description:
        'Capitán América es un súper soldado ágil y fuerte, experto táctico, líder y hábil con su escudo.',
      comic: 'marvel-capitanamerica',
    },
    {
      id: '10',
      superhero: 'Cyclops',
      description:
        'Cyclops, líder de los X-Men, dispara rayos ópticos que controla con su visor especial único.',
      comic: 'marvel-cyclops',
    },
    {
      id: '11',
      superhero: 'Hulk',
      description:
        'Hulk tiene fuerza ilimitada, resistencia extrema y su poder aumenta cuanto más se enfurece.',
      comic: 'marvel-hulk',
    },
    {
      id: '12',
      superhero: 'Silver Surfer',
      description:
        'Silver Surfer viaja por el cosmos en su tabla, controlando energía cósmica para atacar o huir.',
      comic: 'marvel-silversurf',
    },
    {
      id: '13',
      superhero: 'Spider-Man',
      description:
        'Spider-Man es ágil, tiene sentido arácnido y lanza telarañas para moverse y atrapar criminales.',
      comic: 'marvel-spiderman',
    },
    {
      id: '14',
      superhero: 'Thor',
      description:
        'Thor, dios del trueno, maneja el martillo Mjolnir, controla rayos y es un guerrero legendario.',
      comic: 'marvel-thor',
    },
    {
      id: '15',
      superhero: 'Vision',
      description:
        'Vision, androide sintético, vuela, atraviesa objetos sólidos y dispara rayos de energía solar.',
      comic: 'marvel-visionarts',
    },
    {
      id: '16',
      superhero: 'Wolverine',
      description:
        'Wolverine posee garras de adamantium, factor curativo y sentidos agudos que lo hacen letal.',
      comic: 'marvel-wolverine',
    },
    {
      id: '17',
      superhero: 'Mera',
      description:
        'Mera controla el agua, crea estructuras sólidas y es una líder nata con fuerza sobrehumana.',
      comic: 'marvel-mera',
    },
    {
      id: '18',
      superhero: 'Cyborg',
      description:
        'Cyborg fusiona tecnología y humanidad; accede a redes, se adapta y transforma en armas letales.',
      comic: 'dc-cyborg',
    },
  ];

  private heroesSignal = signal<Hero[]>(this.heroes);
  heroes$ = this.heroesSignal.asReadonly();

  constructor(private toastr: ToastrService) {}

  private syncSignal(): void {
    this.heroesSignal.set([...this.heroes]);
  }

  getHeroes(): Observable<Hero[]> {
    return of(this.heroes).pipe(delay(500));
  }

  getHeroById(id: string): Observable<Hero> {
    const hero = this.heroes.find((h) => h.id === id);
    return hero
      ? of(hero).pipe(delay(500))
      : throwError(() => new Error('El héroe no fue encontrado')).pipe(
          delay(500)
        );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    const results = this.heroes.filter((h) =>
      h.superhero.toLowerCase().includes(term.toLowerCase())
    );
    return of(results).pipe(delay(500));
  }

  addHero(hero: Hero): Observable<Hero> {
    const newHero = {
      ...hero,
      id: (Math.max(...this.heroes.map((h) => +h.id), 0) + 1).toString(),
    };
    this.heroes.push(newHero);
    this.syncSignal(); 
    return of(newHero).pipe(delay(500));
  }

  updateHero(updatedHero: Hero): Observable<Hero> {
    const index = this.heroes.findIndex((h) => h.id === updatedHero.id);
    if (index === -1) {
      return throwError(
        () => new Error('No se pudo actualizar: héroe no encontrado')
      ).pipe(delay(500));
    }
    this.heroes[index] = { ...updatedHero };
    this.syncSignal();
    return of(this.heroes[index]).pipe(delay(500));
  }

  deleteHero(id: string): Observable<void> {
    const exists = this.heroes.some((h) => h.id === id);
    if (!exists) {
      return throwError(
        () => new Error('No se pudo eliminar: héroe no encontrado')
      ).pipe(delay(500));
    }
    this.heroes = this.heroes.filter((h) => h.id !== id);
    this.syncSignal();
    return of(undefined).pipe(delay(500));
  }
}
