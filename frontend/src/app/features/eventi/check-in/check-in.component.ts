import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  CheckInService,
  CheckIn,
} from '../../../core/services/check-in.service';
import { EventiService } from '../../../core/services/eventi.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="check-in-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Check-in Partecipanti</mat-card-title>
          <mat-card-subtitle
            >{{ evento?.titolo }} -
            {{ evento?.data | date : 'dd/MM/yyyy HH:mm' }}</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loadingService.loading$ | async" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>

          <table mat-table [dataSource]="iscritti" class="mat-elevation-z8">
            <!-- Nome Column -->
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let iscritto">
                {{ iscritto.utente.nome }}
              </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let iscritto">
                {{ iscritto.utente.email }}
              </td>
            </ng-container>

            <!-- Stato Check-in Column -->
            <ng-container matColumnDef="stato">
              <th mat-header-cell *matHeaderCellDef>Stato Check-in</th>
              <td mat-cell *matCellDef="let iscritto">
                <span [class.check-in-effettuato]="iscritto.checkIn">
                  {{ iscritto.checkIn ? 'Effettuato' : 'Da effettuare' }}
                </span>
                <span *ngIf="iscritto.dataCheckIn" class="data-check-in">
                  ({{ iscritto.dataCheckIn | date : 'dd/MM/yyyy HH:mm' }})
                </span>
              </td>
            </ng-container>

            <!-- Azioni Column -->
            <ng-container matColumnDef="azioni">
              <th mat-header-cell *matHeaderCellDef>Azioni</th>
              <td mat-cell *matCellDef="let iscritto">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="effettuaCheckIn(iscritto)"
                  [disabled]="iscritto.checkIn || !puoEffettuareCheckIn()"
                >
                  <mat-icon>check_circle</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .check-in-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .loading-spinner {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
      table {
        width: 100%;
        margin-top: 20px;
      }
      .check-in-effettuato {
        color: #4caf50;
        font-weight: 500;
      }
      .data-check-in {
        color: #666;
        font-size: 0.9em;
        margin-left: 8px;
      }
      .mat-column-azioni {
        width: 100px;
        text-align: center;
      }
    `,
  ],
})
export class CheckInComponent implements OnInit {
  evento: any;
  iscritti: CheckIn[] = [];
  displayedColumns: string[] = ['nome', 'email', 'stato', 'azioni'];

  constructor(
    private route: ActivatedRoute,
    private checkInService: CheckInService,
    private eventiService: EventiService,
    public loadingService: LoadingService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const eventoId = this.route.snapshot.paramMap.get('id');
    if (eventoId) {
      this.caricaDatiEvento(eventoId);
      this.caricaDatiCheckIn(eventoId);
    }
  }

  caricaDatiEvento(eventoId: string) {
    this.loadingService.show();
    this.eventiService.getEvento(eventoId).subscribe({
      next: (evento) => {
        this.evento = evento;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }

  caricaDatiCheckIn(eventoId: string) {
    this.loadingService.show();
    this.checkInService.getCheckIn(eventoId).subscribe({
      next: (data) => {
        this.iscritti = data;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }

  effettuaCheckIn(iscritto: CheckIn) {
    if (!this.puoEffettuareCheckIn()) {
      this.snackBar.open(
        "Il check-in può essere effettuato solo il giorno dell'evento",
        'OK',
        {
          duration: 5000,
        }
      );
      return;
    }

    this.loadingService.show();
    this.checkInService
      .effettuaCheckIn(this.evento._id, iscritto.utente._id)
      .subscribe({
        next: () => {
          iscritto.checkIn = true;
          iscritto.dataCheckIn = new Date().toISOString();
          this.snackBar.open('Check-in effettuato con successo', 'OK', {
            duration: 3000,
          });
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
          this.loadingService.hide();
        },
      });
  }

  puoEffettuareCheckIn(): boolean {
    if (!this.evento?.data) return false;

    const dataEvento = new Date(this.evento.data);
    const oggi = new Date();

    // Verifica se l'evento è oggi
    return dataEvento.toDateString() === oggi.toDateString();
  }
}
