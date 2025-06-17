import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventoService, Evento } from '../../../core/services/evento.service';
import {
  IscrizioneService,
  Iscrizione,
} from '../../../core/services/iscrizione.service';

@Component({
  selector: 'app-dipendente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Eventi Disponibili</h1>
      <div class="eventi-grid">
        <mat-card *ngFor="let evento of eventi" class="evento-card">
          <mat-card-header>
            <mat-card-title>{{ evento.titolo }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ evento.descrizione }}</p>
            <p>
              <strong>Data:</strong>
              {{ evento.data | date : 'dd/MM/yyyy HH:mm' }}
            </p>
            <p><strong>Luogo:</strong> {{ evento.luogo }}</p>
            <p>
              <strong>Posti disponibili:</strong>
              {{ evento.postiDisponibili }}/{{ evento.postiTotali }}
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              (click)="gestisciIscrizione(evento)"
              [disabled]="evento.postiDisponibili === 0"
            >
              {{ evento.iscritto ? 'Disiscriviti' : 'Iscriviti' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
      }
      .eventi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .evento-card {
        height: 100%;
      }
    `,
  ],
})
export class DipendenteComponent implements OnInit {
  eventi: (Evento & { iscritto: boolean })[] = [];

  constructor(
    private eventoService: EventoService,
    private iscrizioneService: IscrizioneService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.caricaEventi();
  }

  caricaEventi() {
    this.eventoService.getEventi().subscribe({
      next: (eventi) => {
        // Carica le iscrizioni dell'utente
        this.iscrizioneService.listaIscrizioni().subscribe({
          next: (iscrizioni) => {
            this.eventi = eventi.map((evento) => ({
              ...evento,
              iscritto: iscrizioni.some((i) => i.eventoId === evento._id),
            }));
          },
          error: (error) => {
            this.snackBar.open(
              'Errore nel caricamento delle iscrizioni',
              'Chiudi',
              {
                duration: 3000,
              }
            );
          },
        });
      },
      error: (error) => {
        this.snackBar.open('Errore nel caricamento degli eventi', 'Chiudi', {
          duration: 3000,
        });
      },
    });
  }

  gestisciIscrizione(evento: Evento & { iscritto: boolean }) {
    if (evento.iscritto) {
      this.iscrizioneService.disiscrizione(evento._id).subscribe({
        next: () => {
          evento.iscritto = false;
          evento.postiDisponibili++;
          this.snackBar.open(
            'Disiscrizione effettuata con successo',
            'Chiudi',
            {
              duration: 3000,
            }
          );
        },
        error: (error) => {
          this.snackBar.open(
            error.error.message || 'Errore nella disiscrizione',
            'Chiudi',
            {
              duration: 3000,
            }
          );
        },
      });
    } else {
      this.iscrizioneService.iscrizione(evento._id).subscribe({
        next: () => {
          evento.iscritto = true;
          evento.postiDisponibili--;
          this.snackBar.open('Iscrizione effettuata con successo', 'Chiudi', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open(
            error.error.message || "Errore nell'iscrizione",
            'Chiudi',
            {
              duration: 3000,
            }
          );
        },
      });
    }
  }
}
