import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EventiService, Evento } from '../../../core/services/eventi.service';
import { IscrizioniService } from '../../../core/services/iscrizioni.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-eventi-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  template: `
    <div class="eventi-container">
      <div class="header">
        <h1>Eventi</h1>
        <button
          *ngIf="isOrganizzatore"
          mat-raised-button
          color="primary"
          routerLink="nuovo"
        >
          Nuovo Evento
        </button>
      </div>

      <div *ngIf="loadingService.loading$ | async" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div class="eventi-grid">
        <mat-card *ngFor="let evento of eventi" class="evento-card">
          <mat-card-header>
            <mat-card-title>{{ evento.titolo }}</mat-card-title>
            <mat-card-subtitle>{{
              evento.data | date : 'dd/MM/yyyy HH:mm'
            }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ evento.descrizione }}</p>
            <p><strong>Luogo:</strong> {{ evento.luogo }}</p>
            <p>
              <strong>Posti disponibili:</strong> {{ evento.postiDisponibili }}
            </p>
          </mat-card-content>
          <mat-card-actions>
            <ng-container *ngIf="isOrganizzatore">
              <button
                mat-button
                color="primary"
                [routerLink]="[evento._id || '', 'modifica']"
              >
                <mat-icon>edit</mat-icon>
                Modifica
              </button>
              <button
                mat-button
                color="accent"
                [routerLink]="[evento._id || '', 'check-in']"
              >
                <mat-icon>how_to_reg</mat-icon>
                Check-in
              </button>
              <button
                mat-button
                color="warn"
                (click)="eliminaEvento(evento._id || '')"
              >
                <mat-icon>delete</mat-icon>
                Elimina
              </button>
            </ng-container>
            <ng-container *ngIf="!isOrganizzatore">
              <button
                mat-raised-button
                [color]="isIscritto(evento._id || '') ? 'warn' : 'primary'"
                (click)="gestisciIscrizione(evento._id || '')"
                [disabled]="
                  isIscritto(evento._id || '')
                    ? !puoDisiscriversi(evento)
                    : !puoIscriversi(evento)
                "
              >
                <mat-icon>{{
                  isIscritto(evento._id || '') ? 'cancel' : 'how_to_reg'
                }}</mat-icon>
                {{
                  isIscritto(evento._id || '') ? 'Disiscriviti' : 'Iscriviti'
                }}
              </button>
            </ng-container>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .eventi-container {
        padding: 20px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .eventi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      .evento-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .evento-card mat-card-content {
        flex-grow: 1;
      }
      .evento-card mat-card-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .loading-spinner {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
    `,
  ],
})
export class EventiListaComponent implements OnInit, OnDestroy {
  eventi: Evento[] = [];
  isOrganizzatore = false;
  private destroy$ = new Subject<void>();

  constructor(
    private eventiService: EventiService,
    public iscrizioniService: IscrizioniService,
    private authService: AuthService,
    public loadingService: LoadingService,
    private errorHandler: ErrorHandlerService
  ) {
    this.isOrganizzatore = this.authService.getUserRole() === 'organizzatore';
  }

  ngOnInit() {
    this.caricaEventi();
    if (!this.isOrganizzatore) {
      this.caricaIscrizioni();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isIscritto(eventoId: string): boolean {
    return this.iscrizioniService.isIscritto(eventoId);
  }

  caricaEventi() {
    this.loadingService.show();
    this.eventiService
      .getEventi()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (eventi) => {
          this.eventi = eventi;
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.loadingService.hide();
        },
      });
  }

  caricaIscrizioni() {
    this.loadingService.show();
    this.iscrizioniService
      .caricaIscrizioni()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.loadingService.hide();
        },
      });
  }

  gestisciIscrizione(eventoId: string) {
    if (!eventoId) return;

    const isIscritto = this.isIscritto(eventoId);
    const evento = this.eventi.find((e) => e._id === eventoId);

    if (!evento) {
      this.errorHandler.handleError(new Error('Evento non trovato'));
      return;
    }

    if (isIscritto && !this.puoDisiscriversi(evento)) {
      this.errorHandler.handleError(
        new Error('Non è possibile disiscriversi da questo evento')
      );
      return;
    }

    if (!isIscritto && !this.puoIscriversi(evento)) {
      this.errorHandler.handleError(
        new Error('Non è possibile iscriversi a questo evento')
      );
      return;
    }

    this.loadingService.show();
    const request = isIscritto
      ? this.iscrizioniService.disiscrivi(eventoId)
      : this.iscrizioniService.iscrivi(eventoId);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadingService.hide();
        this.caricaIscrizioni();
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }

  puoIscriversi(evento: Evento): boolean {
    if (!evento?.data) return false;

    const dataEvento = new Date(evento.data);
    const oggi = new Date();
    const domani = new Date(oggi);
    domani.setDate(oggi.getDate() + 1);

    return dataEvento > domani && evento.postiDisponibili > 0;
  }

  puoDisiscriversi(evento: Evento): boolean {
    if (!evento?.data) return false;

    const dataEvento = new Date(evento.data);
    const oggi = new Date();

    return dataEvento > oggi;
  }

  eliminaEvento(eventoId: string) {
    if (!eventoId) return;

    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      this.loadingService.show();
      this.eventiService
        .deleteEvento(eventoId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.caricaEventi();
            this.loadingService.hide();
          },
          error: (error) => {
            this.errorHandler.handleError(error);
            this.loadingService.hide();
          },
        });
    }
  }
}
