import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import {
  RichiestaAcquistoService,
  RichiestaAcquisto,
} from '../../core/services/richiesta.service';
import { CategoriaAcquisto } from '../../core/services/categoria.service';
import { CategoriaAcquistoService } from '../../core/services/categoria.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="user-info">
          <div class="user-avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <div class="user-details">
            <h1>{{ currentUser?.nome }} {{ currentUser?.cognome }}</h1>
            <p class="user-email">{{ currentUser?.email }}</p>
            <span class="role-badge">{{ currentUser?.ruolo }}</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Dipendente: Form nuova richiesta e lista richieste personali -->
        <ng-container *ngIf="currentUser?.ruolo === 'Dipendente'">
          <div class="section">
            <h2>Nuova Richiesta di Acquisto</h2>
            <form
              (ngSubmit)="creaRichiesta()"
              #richiestaForm="ngForm"
              class="request-form"
            >
              <div class="form-group">
                <label for="categoria">Categoria</label>
                <select
                  id="categoria"
                  name="categoria"
                  [(ngModel)]="nuovaRichiesta.categoriaID"
                  required
                  class="form-control"
                >
                  <option value="">Seleziona categoria</option>
                  <option *ngFor="let cat of categorie" [value]="cat._id">
                    {{ cat.descrizione }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="oggetto">Oggetto</label>
                <input
                  id="oggetto"
                  name="oggetto"
                  [(ngModel)]="nuovaRichiesta.oggetto"
                  required
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="quantita">Quantità</label>
                <input
                  id="quantita"
                  name="quantita"
                  type="number"
                  [(ngModel)]="nuovaRichiesta.quantita"
                  required
                  min="1"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="costoUnitario">Costo Unitario</label>
                <input
                  id="costoUnitario"
                  name="costoUnitario"
                  type="number"
                  [(ngModel)]="nuovaRichiesta.costoUnitario"
                  required
                  min="0"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="motivazione">Motivazione</label>
                <input
                  id="motivazione"
                  name="motivazione"
                  [(ngModel)]="nuovaRichiesta.motivazione"
                  required
                  class="form-control"
                />
              </div>
              <button type="submit" class="btn btn-primary">
                Invia Richiesta
              </button>
            </form>
          </div>
          <div class="section">
            <h2>Le tue Richieste</h2>
            <div *ngIf="richieste.length === 0" class="no-data">
              Nessuna richiesta trovata.
            </div>
            <table *ngIf="richieste.length > 0" class="request-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Oggetto</th>
                  <th>Quantità</th>
                  <th>Costo Unitario</th>
                  <th>Motivazione</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of richieste">
                  <td>{{ r.dataRichiesta | date : 'short' }}</td>
                  <td>{{ r.categoriaID.descrizione }}</td>
                  <td>{{ r.oggetto }}</td>
                  <td>{{ r.quantita }}</td>
                  <td>{{ r.costoUnitario | currency : 'EUR' }}</td>
                  <td>{{ r.motivazione }}</td>
                  <td>{{ r.stato }}</td>
                  <td>
                    <button
                      *ngIf="r.stato === 'In attesa'"
                      (click)="modificaRichiesta(r)"
                      class="btn btn-sm btn-warning"
                    >
                      Modifica
                    </button>
                    <button
                      *ngIf="r.stato === 'In attesa'"
                      (click)="eliminaRichiesta(r._id)"
                      class="btn btn-sm btn-danger"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- Responsabile: Elenco richieste da approvare e gestione categorie -->
        <ng-container *ngIf="currentUser?.ruolo === 'Responsabile'">
          <div class="section">
            <h2>Richieste da Approvare</h2>
            <div *ngIf="richiesteDaApprovare.length === 0" class="no-data">
              Nessuna richiesta in attesa.
            </div>
            <table
              *ngIf="richiesteDaApprovare.length > 0"
              class="request-table"
            >
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Oggetto</th>
                  <th>Quantità</th>
                  <th>Costo Unitario</th>
                  <th>Motivazione</th>
                  <th>Richiedente</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of richiesteDaApprovare">
                  <td>{{ r.dataRichiesta | date : 'short' }}</td>
                  <td>{{ r.categoriaID.descrizione }}</td>
                  <td>{{ r.oggetto }}</td>
                  <td>{{ r.quantita }}</td>
                  <td>{{ r.costoUnitario | currency : 'EUR' }}</td>
                  <td>{{ r.motivazione }}</td>
                  <td>{{ r.utenteID }}</td>
                  <td>
                    <button
                      (click)="approvaRichiesta(r._id)"
                      class="btn btn-sm btn-success"
                    >
                      Approva
                    </button>
                    <button
                      (click)="rifiutaRichiesta(r._id)"
                      class="btn btn-sm btn-danger"
                    >
                      Rifiuta
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section">
            <h2>Gestione Categorie</h2>
            <form
              (ngSubmit)="aggiungiCategoria()"
              #categoriaForm="ngForm"
              class="category-form"
            >
              <input
                [(ngModel)]="nuovaCategoria"
                name="nuovaCategoria"
                required
                placeholder="Nuova categoria"
                class="form-control"
              />
              <button type="submit" class="btn btn-primary">Aggiungi</button>
            </form>
            <ul class="category-list">
              <li *ngFor="let cat of categorie">
                {{ cat.descrizione }}
                <button
                  (click)="modificaCategoria(cat)"
                  class="btn btn-sm btn-warning"
                >
                  Modifica
                </button>
                <button
                  (click)="eliminaCategoria(cat._id)"
                  class="btn btn-sm btn-danger"
                >
                  Elimina
                </button>
              </li>
            </ul>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .user-avatar {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(255, 255, 255, 0.3);
      }

      .avatar-icon {
        font-size: 24px;
      }

      .user-details h1 {
        margin: 0 0 5px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .user-email {
        margin: 0 0 10px 0;
        opacity: 0.9;
        font-size: 14px;
      }

      .role-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .access-section {
        background: #f8f9fa;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 30px;
      }

      .access-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 20px;
      }

      .upgrade-section {
        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        border-left: 4px solid #2196f3;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .upgrade-section h3 {
        margin: 0 0 10px 0;
        color: #1976d2;
        font-weight: 600;
      }

      .upgrade-section p {
        margin: 0 0 15px 0;
        color: #424242;
        line-height: 1.5;
      }

      .tab-navigation {
        display: flex;
        background: #f8f9fa;
        border-radius: 10px;
        padding: 5px;
        margin-bottom: 20px;
      }

      .tab-btn {
        flex: 1;
        padding: 15px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .tab-btn.active {
        background: #007bff;
        color: white;
      }

      .tab-btn:hover:not(.active) {
        background: #e9ecef;
      }

      .tab-content {
        background: white;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .tab-pane h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
      }

      .no-data {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 40px;
      }

      .partecipanti-list {
        display: grid;
        gap: 15px;
      }

      .partecipante-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }

      .email {
        color: #6c757d;
        font-size: 0.9em;
      }

      .badge.organizer {
        background: #28a745;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
      }

      .create-match-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
      }

      .match-form {
        display: grid;
        gap: 15px;
        max-width: 400px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        margin-bottom: 5px;
        font-weight: 500;
      }

      .form-control {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1em;
      }

      .incontri-grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }

      .classifica-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .classifica-table th,
      .classifica-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .classifica-table th {
        background: #f8f9fa;
        font-weight: 600;
      }

      .classifica-table tr:hover {
        background: #f8f9fa;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      .btn-success {
        background: #28a745;
        color: white;
      }

      .btn-success:hover {
        background: #1e7e34;
      }

      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background: #c82333;
      }

      .btn-sm {
        padding: 5px 10px;
        font-size: 0.9em;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  // Dipendente
  nuovaRichiesta: any = {
    categoriaID: '',
    oggetto: '',
    quantita: 1,
    costoUnitario: 0,
    motivazione: '',
  };
  richieste: RichiestaAcquisto[] = [];
  // Responsabile
  richiesteDaApprovare: RichiestaAcquisto[] = [];
  categorie: CategoriaAcquisto[] = [];
  nuovaCategoria: string = '';

  constructor(
    private authService: AuthService,
    private richiestaService: RichiestaAcquistoService,
    private categoriaService: CategoriaAcquistoService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      window.location.href = '/login';
      return;
    }
    this.loadCategorie();
    if (this.currentUser.ruolo === 'Dipendente') {
      this.loadRichiesteDipendente();
    } else if (this.currentUser.ruolo === 'Responsabile') {
      this.loadRichiesteDaApprovare();
      this.loadCategorie();
    }
  }

  // --- Dipendente ---
  creaRichiesta() {
    if (
      !this.nuovaRichiesta.categoriaID ||
      !this.nuovaRichiesta.oggetto ||
      !this.nuovaRichiesta.quantita ||
      !this.nuovaRichiesta.costoUnitario ||
      !this.nuovaRichiesta.motivazione
    ) {
      alert('Compila tutti i campi');
      return;
    }
    this.richiestaService.creaRichiesta(this.nuovaRichiesta).subscribe({
      next: () => {
        this.nuovaRichiesta = {
          categoriaID: '',
          oggetto: '',
          quantita: 1,
          costoUnitario: 0,
          motivazione: '',
        };
        this.loadRichiesteDipendente();
      },
      error: (err) =>
        alert(err.error?.message || 'Errore nella creazione richiesta'),
    });
  }

  loadRichiesteDipendente() {
    this.richiestaService.getRichieste().subscribe({
      next: (data) => {
        this.richieste = data;
      },
      error: (err) => console.error('Errore caricamento richieste:', err),
    });
  }

  modificaRichiesta(r: RichiestaAcquisto) {
    if (!r._id) return;
    const nuovoOggetto = prompt('Modifica oggetto:', r.oggetto);
    if (nuovoOggetto !== null) {
      this.richiestaService
        .aggiornaRichiesta(r._id, {
          categoriaID: r.categoriaID,
          oggetto: nuovoOggetto,
          quantita: r.quantita,
          costoUnitario: r.costoUnitario,
          motivazione: r.motivazione,
        })
        .subscribe({
          next: () => this.loadRichiesteDipendente(),
          error: (err) =>
            alert(err.error?.message || 'Errore modifica richiesta'),
        });
    }
  }

  eliminaRichiesta(id?: string) {
    if (!id) return;
    if (confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      this.richiestaService.eliminaRichiesta(id).subscribe({
        next: () => this.loadRichiesteDipendente(),
        error: (err) =>
          alert(err.error?.message || 'Errore eliminazione richiesta'),
      });
    }
  }

  // --- Responsabile ---
  loadRichiesteDaApprovare() {
    this.richiestaService.getRichiesteDaApprovare().subscribe({
      next: (data) => {
        this.richiesteDaApprovare = data;
      },
      error: (err) => console.error('Errore richieste da approvare:', err),
    });
  }

  approvaRichiesta(id?: string) {
    if (!id) return;
    if (confirm('Approvare questa richiesta?')) {
      this.richiestaService.approvaRichiesta(id).subscribe({
        next: () => this.loadRichiesteDaApprovare(),
        error: (err) =>
          alert(err.error?.message || 'Errore approvazione richiesta'),
      });
    }
  }

  rifiutaRichiesta(id?: string) {
    if (!id) return;
    if (confirm('Rifiutare questa richiesta?')) {
      this.richiestaService.rifiutaRichiesta(id).subscribe({
        next: () => this.loadRichiesteDaApprovare(),
        error: (err) => alert(err.error?.message || 'Errore rifiuto richiesta'),
      });
    }
  }

  // --- Categorie ---
  loadCategorie() {
    this.categoriaService.getCategorie().subscribe({
      next: (data) => {
        this.categorie = data;
      },
      error: (err) => console.error('Errore caricamento categorie:', err),
    });
  }

  aggiungiCategoria() {
    if (!this.nuovaCategoria) return;
    this.categoriaService
      .creaCategoria({ descrizione: this.nuovaCategoria })
      .subscribe({
        next: () => {
          this.nuovaCategoria = '';
          this.loadCategorie();
        },
        error: (err) =>
          alert(err.error?.message || 'Errore aggiunta categoria'),
      });
  }

  modificaCategoria(cat: CategoriaAcquisto) {
    if (!cat._id) return;
    const nuovaDescrizione = prompt(
      'Modifica descrizione categoria:',
      cat.descrizione
    );
    if (nuovaDescrizione !== null && nuovaDescrizione.trim() !== '') {
      this.categoriaService
        .aggiornaCategoria(cat._id, { descrizione: nuovaDescrizione })
        .subscribe({
          next: () => this.loadCategorie(),
          error: (err) =>
            alert(err.error?.message || 'Errore modifica categoria'),
        });
    }
  }

  eliminaCategoria(id?: string) {
    if (!id) return;
    if (confirm('Eliminare questa categoria?')) {
      this.categoriaService.eliminaCategoria(id).subscribe({
        next: () => this.loadCategorie(),
        error: (err) =>
          alert(err.error?.message || 'Errore eliminazione categoria'),
      });
    }
  }
}
