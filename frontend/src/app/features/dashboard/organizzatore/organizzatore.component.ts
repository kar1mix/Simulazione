import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { EventoDialogComponent } from './evento-dialog/evento-dialog.component';

@Component({
  selector: 'app-organizzatore',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Gestione Eventi</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="apriDialogNuovoEvento()"
        >
          Nuovo Evento
        </button>
      </div>
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
              (click)="apriDialogModificaEvento(evento)"
            >
              Modifica
            </button>
            <button
              mat-raised-button
              color="warn"
              (click)="eliminaEvento(evento)"
            >
              Elimina
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
      }
      mat-card-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class OrganizzatoreComponent implements OnInit {
  eventi: Evento[] = [];

  constructor(
    private eventoService: EventoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.caricaEventi();
  }

  caricaEventi() {
    this.eventoService.getEventi().subscribe({
      next: (eventi) => {
        this.eventi = eventi;
      },
      error: (error) => {
        this.snackBar.open('Errore nel caricamento degli eventi', 'Chiudi', {
          duration: 3000,
        });
      },
    });
  }

  apriDialogNuovoEvento() {
    const dialogRef = this.dialog.open(EventoDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventoService.createEvento(result).subscribe({
          next: (nuovoEvento) => {
            this.eventi.push(nuovoEvento);
            this.snackBar.open('Evento creato con successo', 'Chiudi', {
              duration: 3000,
            });
          },
          error: (error) => {
            this.snackBar.open(
              error.error.message || "Errore nella creazione dell'evento",
              'Chiudi',
              {
                duration: 3000,
              }
            );
          },
        });
      }
    });
  }

  apriDialogModificaEvento(evento: Evento) {
    const dialogRef = this.dialog.open(EventoDialogComponent, {
      width: '500px',
      data: { ...evento },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventoService.updateEvento(evento._id, result).subscribe({
          next: (eventoAggiornato) => {
            const index = this.eventi.findIndex((e) => e._id === evento._id);
            if (index !== -1) {
              this.eventi[index] = eventoAggiornato;
            }
            this.snackBar.open('Evento aggiornato con successo', 'Chiudi', {
              duration: 3000,
            });
          },
          error: (error) => {
            this.snackBar.open(
              error.error.message || "Errore nell'aggiornamento dell'evento",
              'Chiudi',
              {
                duration: 3000,
              }
            );
          },
        });
      }
    });
  }

  eliminaEvento(evento: Evento) {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      this.eventoService.deleteEvento(evento._id).subscribe({
        next: () => {
          this.eventi = this.eventi.filter((e) => e._id !== evento._id);
          this.snackBar.open('Evento eliminato con successo', 'Chiudi', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open(
            error.error.message || "Errore nell'eliminazione dell'evento",
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
