import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatisticheService } from '../../core/services/statistiche.service';
import { LoadingService } from '../../shared/services/loading.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
  ],
  template: `
    <div class="statistiche-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Statistiche Eventi</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="dateForm" (ngSubmit)="caricaStatistiche()">
            <div class="date-filters">
              <mat-form-field>
                <mat-label>Data Inizio</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="start"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="startPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Data Fine</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="end"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="endPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="dateForm.invalid"
              >
                Aggiorna
              </button>
            </div>
          </form>

          <div *ngIf="loadingService.loading$ | async" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="statistiche" class="statistiche-content">
            <div class="statistiche-summary">
              <div class="stat-card">
                <h3>Totale Eventi</h3>
                <p>{{ statistiche.totaleEventi }}</p>
              </div>
              <div class="stat-card">
                <h3>Totale Iscrizioni</h3>
                <p>{{ statistiche.totaleIscrizioni }}</p>
              </div>
              <div class="stat-card">
                <h3>Media Partecipanti</h3>
                <p>{{ statistiche.mediaPartecipanti | number : '1.0-1' }}</p>
              </div>
            </div>

            <div class="charts-container">
              <div class="chart">
                <h3>Eventi per Mese</h3>
                <ngx-charts-bar-vertical-2d
                  [view]="[600, 300]"
                  [scheme]="colorScheme"
                  [results]="eventiPerMeseData"
                  [gradient]="true"
                  [xAxis]="true"
                  [yAxis]="true"
                  [legend]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Mese"
                  yAxisLabel="Numero Eventi"
                >
                </ngx-charts-bar-vertical-2d>
              </div>

              <div class="chart">
                <h3>Partecipanti per Evento</h3>
                <ngx-charts-bar-vertical-2d
                  [view]="[600, 300]"
                  [scheme]="colorScheme"
                  [results]="partecipantiPerEventoData"
                  [gradient]="true"
                  [xAxis]="true"
                  [yAxis]="true"
                  [legend]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Evento"
                  yAxisLabel="Partecipanti"
                >
                </ngx-charts-bar-vertical-2d>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .statistiche-container {
        padding: 20px;
      }
      .date-filters {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        align-items: center;
      }
      .loading-spinner {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
      .statistiche-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      .stat-card {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }
      .stat-card h3 {
        margin: 0 0 10px 0;
        color: #666;
      }
      .stat-card p {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
        color: #333;
      }
      .charts-container {
        display: grid;
        gap: 30px;
      }
      .chart {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .chart h3 {
        margin: 0 0 20px 0;
        color: #333;
      }
    `,
  ],
})
export class StatisticheComponent implements OnInit {
  dateForm: FormGroup;
  statistiche: any;
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    private fb: FormBuilder,
    private statisticheService: StatisticheService,
    public loadingService: LoadingService,
    private errorHandler: ErrorHandlerService
  ) {
    this.dateForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Imposta date di default (ultimi 6 mesi)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);

    this.dateForm.patchValue({
      start,
      end,
    });

    this.caricaStatistiche();
  }

  get eventiPerMeseData() {
    if (!this.statistiche?.eventiPerMese) return [];
    return this.statistiche.eventiPerMese.map((item: any) => ({
      name: item.mese,
      value: item.numeroEventi,
    }));
  }

  get partecipantiPerEventoData() {
    if (!this.statistiche?.partecipantiPerEvento) return [];
    return this.statistiche.partecipantiPerEvento.map((item: any) => ({
      name: item.titolo,
      value: item.numeroPartecipanti,
    }));
  }

  caricaStatistiche() {
    if (this.dateForm.invalid) return;

    const { start, end } = this.dateForm.value;
    const params = {
      dal: start.toISOString().split('T')[0],
      al: end.toISOString().split('T')[0],
    };

    this.loadingService.show();
    this.statisticheService.getStatistiche(params).subscribe({
      next: (data) => {
        this.statistiche = data;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorHandler.handleError(error);
        this.loadingService.hide();
      },
    });
  }
}
