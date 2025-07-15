import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StatisticheRichiesteService,
  StatisticaRichiesta,
} from '../../core/services/statistiche.service';
import {
  CategoriaAcquistoService,
  CategoriaAcquisto,
} from '../../core/services/categoria.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="statistiche-container card animate-fade-in">
      <h1>Statistiche Richieste Approvate</h1>
      <div class="statistiche-filters">
        <div class="form-group">
          <label for="mese">Mese</label>
          <input
            id="mese"
            name="mese"
            type="month"
            [(ngModel)]="meseFiltro"
            (change)="caricaStatistiche()"
            class="form-control filtro-input"
          />
        </div>
        <div class="form-group">
          <label for="categoria">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            [(ngModel)]="categoriaFiltro"
            (change)="caricaStatistiche()"
            class="form-control filtro-input"
          >
            <option value="">Tutte</option>
            <option *ngFor="let cat of categorie" [value]="cat.descrizione">
              {{ cat.descrizione }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary filtro-btn" (click)="resetFiltri()">
          Reset
        </button>
      </div>
      <div *ngIf="loading" class="spinner-overlay">
        <div class="spinner"></div>
      </div>
      <div *ngIf="statistiche.length === 0 && !loading" class="no-data">
        Nessun dato disponibile per i filtri selezionati.
      </div>
      <table
        *ngIf="statistiche.length > 0 && !loading"
        class="statistiche-table modern-table animate-fade-in better-table"
      >
        <thead>
          <tr>
            <th>Mese</th>
            <th>Categoria</th>
            <th>Numero Richieste</th>
            <th>Costo Totale</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of statistiche">
            <td>{{ s.mese }}</td>
            <td>{{ s.categoria }}</td>
            <td>{{ s.numeroRichieste }}</td>
            <td>{{ s.costoTotale | currency : 'EUR' }}</td>
          </tr>
        </tbody>
      </table>
      <div
        *ngIf="statistiche.length > 0 && !loading"
        class="chart-section animate-fade-in"
      >
        <h2 class="chart-title">Grafico per Categoria</h2>
        <div class="chart-canvas-wrapper">
          <canvas id="barChart"></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .statistiche-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 32px 16px 40px 16px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 24px rgba(102, 126, 234, 0.1);
        margin-top: 40px;
      }
      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 28px;
        color: #333;
      }
      .statistiche-filters {
        display: flex;
        gap: 32px;
        margin-bottom: 36px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        min-width: 180px;
      }
      .form-group label {
        margin-bottom: 7px;
        font-size: 1.08em;
        font-weight: 500;
        color: #444;
        letter-spacing: 0.01em;
      }
      .filtro-input {
        min-width: 160px;
        margin-bottom: 0;
      }
      .filtro-btn {
        margin-top: 18px;
        min-width: 110px;
      }
      .form-control {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1em;
      }
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
        background: #6c757d;
        color: #fff;
      }
      .btn:hover {
        background: #495057;
      }
      .statistiche-table {
        margin-top: 18px;
        margin-bottom: 36px;
      }
      .better-table {
        border-radius: 18px;
        box-shadow: 0 4px 24px rgba(102, 126, 234, 0.1);
        background: #fff;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        margin-top: 18px;
      }
      .better-table th {
        background: #f3f7ff;
        font-weight: 700;
        font-size: 1.08em;
        padding: 18px 14px;
        border-bottom: 2px solid #e3e8f0;
        letter-spacing: 0.02em;
        text-align: left;
      }
      .better-table td {
        padding: 16px 14px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 1.04em;
        color: #333;
        vertical-align: middle;
      }
      .better-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      .better-table tr:last-child td {
        border-bottom: none;
      }
      .better-table th:first-child,
      .better-table td:first-child {
        border-top-left-radius: 12px;
      }
      .better-table th:last-child,
      .better-table td:last-child {
        border-top-right-radius: 12px;
      }
      .chart-section {
        margin-top: 40px;
        background: #f8f9fa;
        border-radius: 14px;
        padding: 36px 18px 28px 18px;
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.07);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .chart-title {
        margin-bottom: 28px;
        font-size: 1.25em;
        font-weight: 600;
        color: #444;
        letter-spacing: 0.01em;
        text-align: center;
      }
      .chart-canvas-wrapper {
        width: 100%;
        max-width: 700px;
        min-width: 260px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding-bottom: 12px;
        margin: 0 auto;
      }
      canvas#barChart {
        display: block;
        margin: 0 auto;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.06);
        max-width: 100%;
        height: 260px !important;
      }
      .no-data {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 40px;
      }
      @media (max-width: 700px) {
        .statistiche-filters {
          flex-direction: column;
          gap: 14px;
        }
        .statistiche-container {
          padding: 12px 2vw 24px 2vw;
        }
        .better-table th,
        .better-table td {
          padding: 10px 6px;
          font-size: 0.98em;
        }
        .chart-section {
          padding: 18px 2vw 18px 2vw;
        }
        .chart-title {
          margin-bottom: 16px;
        }
        .chart-canvas-wrapper {
          max-width: 98vw;
          padding-bottom: 6px;
        }
        canvas#barChart {
          height: 180px !important;
        }
      }
    `,
  ],
})
export class StatisticheComponent implements OnInit {
  meseFiltro: string = '';
  categoriaFiltro: string = '';
  categorie: CategoriaAcquisto[] = [];
  statistiche: StatisticaRichiesta[] = [];
  loading = false;

  constructor(
    private statisticheService: StatisticheRichiesteService,
    private categoriaService: CategoriaAcquistoService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getCurrentUser()?.ruolo !== 'Responsabile') {
      window.location.href = '/dashboard';
      return;
    }
    this.caricaCategorie();
    this.caricaStatistiche();
  }

  caricaCategorie() {
    this.categoriaService.getCategorie().subscribe({
      next: (data) => (this.categorie = data),
      error: (err) => this.errorHandler.handleError(err),
    });
  }

  caricaStatistiche() {
    this.loading = true;
    this.statisticheService
      .getStatistiche(this.meseFiltro, this.categoriaFiltro)
      .subscribe({
        next: (data) => {
          this.statistiche = data;
          this.loading = false;
          setTimeout(() => this.renderChart(), 100);
        },
        error: (err) => {
          this.errorHandler.handleError(err);
          this.loading = false;
        },
      });
  }

  resetFiltri() {
    this.meseFiltro = '';
    this.categoriaFiltro = '';
    this.caricaStatistiche();
  }

  renderChart() {
    // Usa Chart.js se disponibile, altrimenti fallback semplice
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Semplice bar chart: categoria sull'asse X, costoTotale sull'asse Y
    const data = this.statistiche;
    if (data.length === 0) return;
    // Parametri base
    const barWidth = 40;
    const gap = 80; // Gap molto più ampio tra le barre
    const leftPadding = 80;
    const rightPadding = 80;
    const width = (canvas.width = Math.max(
      400,
      data.length * gap + leftPadding + rightPadding
    ));
    const height = (canvas.height = 260);
    const max = Math.max(...data.map((d) => d.costoTotale));
    // Disegna le barre e le etichette
    data.forEach((d, i) => {
      const x = leftPadding + i * gap;
      const barHeight = (d.costoTotale / max) * 180;
      const y = height - barHeight - 36;
      // Barra
      ctx.fillStyle = '#667eea';
      ctx.fillRect(x, y, barWidth, barHeight);
      // Etichetta categoria centrata sotto la barra
      ctx.fillStyle = '#333';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.categoria, x + barWidth / 2, height - 12);
      // Valore sopra la barra
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#444';
      ctx.fillText(d.costoTotale.toFixed(2) + '€', x + barWidth / 2, y - 8);
    });
  }
}
