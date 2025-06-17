import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
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
                [color]="
                  iscrizioniService.isIscritto(evento._id || '')
                    ? 'warn'
                    : 'primary'
                "
                (click)="gestisciIscrizione(evento._id || '')"
              >
                {{
                  iscrizioniService.isIscritto(evento._id || '')
                    ? 'Disiscriviti'
                    : 'Iscriviti'
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
export class EventiListaComponent implements OnInit {
  eventi: Evento[] = [];
  isOrganizzatore = false;

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
  }

  caricaEventi() {
    this.loadingService.show();
    this.eventiService.getEventi().subscribe({
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

  gestisciIscrizione(eventoId: string) {
    if (!eventoId) return;

    this.loadingService.show();
    const request = this.iscrizioniService.isIscritto(eventoId)
      ? this.iscrizioniService.disiscrivi(eventoId)
      : this.iscrizioniService.iscrivi(eventoId);

    request.subscribe({
      next: () => {
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }

  eliminaEvento(eventoId: string) {
    if (!eventoId) return;

    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      this.loadingService.show();
      this.eventiService.deleteEvento(eventoId).subscribe({
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
