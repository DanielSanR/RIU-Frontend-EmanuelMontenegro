import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { HeroService } from '@core/services/hero.service';
import { Hero } from '@shared/models/hero.models';
import { SearchFilterComponent } from '@shared/ui/input/search-filter/search-filter.component';
import { BaseDialogComponent } from '@shared/ui/dialog/base-dialog.component';
import { CardHeroComponent } from '@shared/ui/card/card-hero/card-hero.component';
import { SpinnerService } from '@core/services/spinner.service';

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatPaginator,
    MatTableModule,
    SearchFilterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
//mal uso de signals, la idea de signals es hacer radiactivo el estado de los heroes, y usas loadheores para cargar los heroes y actualizar
//en acciones tenes el + que no esta bien, es redundante tenerlo ahi por que es una accion global que refleja a toda la lista no a un heroe en concreto
//podias poner el agregar heroe en al final de la seccion de filtro en la parte superior derecha ( despues de filtrar)
export class ListComponent implements OnInit {
  //podias usar signal para la paginacion
  currentPage = 0;
  itemsPerPage = 5;
  heroes: Hero[] = [];
  filteredHeroes: Hero[] = [];
  dataSource = new MatTableDataSource<Hero>();

  displayedColumns: string[] = [
    'id',
    'image',
    'name',
    'description',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedOption = '';
  heroNames: string[] = [];
  searchOptions = [
    { value: 'name', label: 'Nombre de Héroe' },
    { value: 'parameter', label: 'Parámetro de Nombre' },
    { value: 'id', label: 'ID' },
  ];

  useMatSelect = false;
  private spinner = inject(SpinnerService);
  private heroService = inject(HeroService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private breakpointObserver = inject(BreakpointObserver);
  //no hace falta este observer para la tabla nomas
  private isMobile$ = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches));
  isMobile = toSignal(this.isMobile$, { initialValue: false });

  ngOnInit(): void {
    this.loadHeroes();
  }

  loadHeroes(): void {
    this.spinner.show();

    this.heroService.getHeroes().subscribe({
      next: (data) => {
        this.heroes = data.map((hero) => ({
          ...hero,
          comic: hero.comic || 'default',
        }));
        this.filteredHeroes = [...this.heroes];
        this.dataSource.data = this.filteredHeroes;
        this.dataSource.paginator = this.paginator;
        this.heroNames = this.heroes.map((h) => h.superhero);
        this.spinner.hide();
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los héroes', 'Error');
        this.spinner.hide();
      },
    });
  }

  openPreview(hero: Hero): void {
    this.dialog.open(CardHeroComponent, {
      data: {
        type: 'preview',
        image: `assets/img/${hero.comic?.toLowerCase() || 'default'}.jpeg`,
        name: hero.superhero,
        description: hero.description,
      },
      panelClass: 'hero-preview-dialog-panel',
      backdropClass: 'dialog-blur-backdrop',
    });
  }

  addHero(): void {
    this.router.navigate(['hero/add']);
  }
  editHero(hero: Hero): void {
    this.router.navigate(['hero/edit', hero.id]);
  }

  deleteHero(hero: Hero): void {
    const dialogRef = this.dialog.open(BaseDialogComponent, {
      data: {
        type: 'confirm',
        name: hero.superhero,
      },
      panelClass: 'transparent-dialog-panel',
      backdropClass: 'dialog-blur-backdrop',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.heroService.deleteHero(hero.id).subscribe({
          next: () => {
            this.toastr.success(
              `El héroe <b>${hero.superhero}</b> fue eliminado correctamente.`,
              'Éxito',
              { enableHtml: true }
            );
            // esto si usas computed la lista se actualiza solo
            this.loadHeroes();
          },
          error: () => {
            this.toastr.error(
              'No se pudo eliminar el héroe. Intente más tarde.',
              'Error'
            );
          },
        });
      }
    });
  }

  onSelectChange(option: string): void {
    this.selectedOption = option;
    this.useMatSelect = option === 'name';
    this.filteredHeroes = [...this.heroes];
  }

  //super complicado y poco legible el filter este
  //podias usar un computed para filtrar los heroes y un setter
  onFilterApplied(searchText: string): void {
    const parsedId = Number(searchText);
    const query = searchText.trim().toLowerCase();

    if (!this.selectedOption) {
      this.toastr.warning(
        'Seleccioná un tipo de búsqueda primero.',
        'Atención'
      );
      return;
    }

    if (this.selectedOption === 'name') {
      const hero = this.heroes.find((h) => h.superhero.toLowerCase() === query);
      if (hero) {
        this.filteredHeroes = [hero];
      } else {
        this.toastr.warning(
          'No se encontraron héroes con ese nombre.',
          'Sin resultados'
        );

        this.filteredHeroes = [...this.heroes];
      }
    } else if (this.selectedOption === 'parameter') {
      this.filteredHeroes = this.heroes.filter((h) =>
        h.superhero.toLowerCase().includes(query)
      );
      if (this.filteredHeroes.length === 0) {
        this.toastr.warning(
          'Ningún héroe coincide con ese texto.',
          'Sin Coincidencias'
        );
        this.filteredHeroes = [...this.heroes];
      }
    } else if (this.selectedOption === 'id') {
      if (!searchText || isNaN(parsedId) || parsedId <= 0) {
        this.toastr.warning(
          'Ingresá un ID válido (número positivo).',
          'Atención'
        );
        this.filteredHeroes = [...this.heroes];
        this.dataSource.data = this.filteredHeroes;

        this.clearInputs();
        return;
      }

      this.heroService.getHeroById(String(parsedId)).subscribe({
        next: (hero) => {
          this.filteredHeroes = [hero];
          this.dataSource.data = this.filteredHeroes;
        },
        error: () => {
          this.toastr.error(
            'No existe un héroe con el número ingresado.',
            'Error'
          );
          this.filteredHeroes = [...this.heroes];
          this.dataSource.data = this.filteredHeroes;
        },
      });

      return;
    }

    this.dataSource.data = this.filteredHeroes;
  }

  get paginatedCards(): Hero[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredHeroes.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;

    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    if (!this.isMobile()) {
      this.dataSource.data = this.filteredHeroes;
    } else {
      this.dataSource.data = this.paginatedCards;
    }
  }

  clearInputs(): void {
    this.selectedOption = '';
    this.loadHeroes();
  }
}
