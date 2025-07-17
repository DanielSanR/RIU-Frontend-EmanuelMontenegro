import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Hero } from '@shared/models/hero.models';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/heroes';

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  getHeroById(id: string): Observable<Hero> {
    return this.http.get<Hero>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  searchHeroes(term: string): Observable<Hero[]> {
    return this.http.get<Hero[]>(`${this.baseUrl}?superhero_like=${term}`).pipe(catchError(this.handleError));
  }

  updateHero(hero: Hero): Observable<Hero> {
    return this.http.put<Hero>(`${this.baseUrl}/${hero.id}`, hero).pipe(catchError(this.handleError));
  }

  deleteHero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  addHero(hero: Hero): Observable<Hero> {
    hero.id = String(hero.id);
    return this.http.post<Hero>(this.baseUrl, hero).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error('Hubo un problema con la solicitud. Inténtalo más tarde.'));
  }
}
