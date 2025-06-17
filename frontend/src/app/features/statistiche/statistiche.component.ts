import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  StatisticheService,
  Statistiche,
} from '../../core/services/statistiche.service';

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatProgressBarModule],
  template: `
    <div class="statistiche-container">
      <h1>Statistiche Eventi</h1>

      <div class="statistiche-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Panoramica</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-item">
              <span class="label">Totale Eventi:</span>
              <span class="value">{{ statistiche?.totaleEventi || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Totale Iscrizioni:</span>
              <span class="value">{{
                statistiche?.totaleIscrizioni || 0
              }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Media Partecipanti:</span>
              <span class="value">{{
                statistiche?.mediaPartecipanti || 0 | number : '1.0-1'
              }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Eventi per Mese</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table
              mat-table
              [dataSource]="statistiche?.eventiPerMese || []"
              class="mat-elevation-z0"
            >
              <ng-container matColumnDef="mese">
                <th mat-header-cell *matHeaderCellDef>Mese</th>
                <td mat-cell *matCellDef="let item">{{ item.mese }}</td>
              </ng-container>

              <ng-container matColumnDef="numeroEventi">
                <th mat-header-cell *matHeaderCellDef>Numero Eventi</th>
                <td mat-cell *matCellDef="let item">
                  <div class="progress-container">
                    <span class="value">{{ item.numeroEventi }}</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="(item.numeroEventi / maxEventiPerMese) * 100"
                    ></mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <tr
                mat-header-row
                *matHeaderRowDef="['mese', 'numeroEventi']"
              ></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: ['mese', 'numeroEventi']"
              ></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>Partecipanti per Evento</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table
              mat-table
              [dataSource]="statistiche?.partecipantiPerEvento || []"
              class="mat-elevation-z0"
            >
              <ng-container matColumnDef="titolo">
                <th mat-header-cell *matHeaderCellDef>Evento</th>
                <td mat-cell *matCellDef="let item">{{ item.titolo }}</td>
              </ng-container>

              <ng-container matColumnDef="numeroPartecipanti">
                <th mat-header-cell *matHeaderCellDef>Partecipanti</th>
                <td mat-cell *matCellDef="let item">
                  <div class="progress-container">
                    <span class="value">{{ item.numeroPartecipanti }}</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="
                        (item.numeroPartecipanti / maxPartecipanti) * 100
                      "
                    ></mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <tr
                mat-header-row
                *matHeaderRowDef="['titolo', 'numeroPartecipanti']"
              ></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: ['titolo', 'numeroPartecipanti']"
              ></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .statistiche-container {
        padding: 20px;
      }
      .statistiche-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .stat-card {
        height: 100%;
      }
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }
      .label {
        font-weight: 500;
      }
      .value {
        font-size: 1.2em;
        font-weight: 500;
      }
      .progress-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .progress-container .value {
        min-width: 40px;
        text-align: right;
      }
      mat-progress-bar {
        flex-grow: 1;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class StatisticheComponent implements OnInit {
  statistiche: Statistiche | null = null;
  maxEventiPerMese = 0;
  maxPartecipanti = 0;

  constructor(private statisticheService: StatisticheService) {}

  ngOnInit() {
    this.caricaStatistiche();
  }

  caricaStatistiche() {
    this.statisticheService.getStatistiche().subscribe({
      next: (statistiche) => {
        this.statistiche = statistiche;
        // Calcola i valori massimi per le barre di progresso
        this.maxEventiPerMese = Math.max(
          ...statistiche.eventiPerMese.map((e) => e.numeroEventi)
        );
        this.maxPartecipanti = Math.max(
          ...statistiche.partecipantiPerEvento.map((p) => p.numeroPartecipanti)
        );
      },
      error: (error) => {
        console.error('Errore nel caricamento delle statistiche:', error);
      },
    });
  }
}
