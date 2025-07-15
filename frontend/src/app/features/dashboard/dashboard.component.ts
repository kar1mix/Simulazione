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
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

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

      <div class="main-content" [attr.aria-busy]="loading">
        <div
          *ngIf="loading"
          class="spinner-overlay"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="spinner"></div>
        </div>
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
                  #categoriaCtrl="ngModel"
                >
                  <option value="">Seleziona categoria</option>
                  <option *ngFor="let cat of categorie" [value]="cat._id">
                    {{ cat.descrizione }}
                  </option>
                </select>
                <div
                  class="invalid-feedback"
                  *ngIf="categoriaCtrl.invalid && categoriaCtrl.touched"
                >
                  Seleziona una categoria.
                </div>
              </div>
              <div class="form-group">
                <label for="oggetto">Oggetto</label>
                <input
                  id="oggetto"
                  name="oggetto"
                  [(ngModel)]="nuovaRichiesta.oggetto"
                  required
                  class="form-control"
                  #oggettoCtrl="ngModel"
                />
                <div
                  class="invalid-feedback"
                  *ngIf="oggettoCtrl.invalid && oggettoCtrl.touched"
                >
                  Inserisci l'oggetto della richiesta.
                </div>
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
                  #quantitaCtrl="ngModel"
                />
                <div
                  class="invalid-feedback"
                  *ngIf="quantitaCtrl.invalid && quantitaCtrl.touched"
                >
                  Inserisci una quantità valida (minimo 1).
                </div>
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
                  #costoCtrl="ngModel"
                />
                <div
                  class="invalid-feedback"
                  *ngIf="costoCtrl.invalid && costoCtrl.touched"
                >
                  Inserisci un costo unitario valido (>= 0).
                </div>
              </div>
              <div class="form-group">
                <label for="motivazione">Motivazione</label>
                <input
                  id="motivazione"
                  name="motivazione"
                  [(ngModel)]="nuovaRichiesta.motivazione"
                  required
                  class="form-control"
                  #motivazioneCtrl="ngModel"
                />
                <div
                  class="invalid-feedback"
                  *ngIf="motivazioneCtrl.invalid && motivazioneCtrl.touched"
                >
                  Inserisci la motivazione della richiesta.
                </div>
              </div>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!richiestaForm.form.valid"
              >
                Invia Richiesta
              </button>
            </form>
          </div>
          <div class="section">
            <h2>Le tue Richieste</h2>
            <div *ngIf="richieste.length === 0" class="no-data">
              Nessuna richiesta trovata.
            </div>
            <table
              *ngIf="richieste.length > 0"
              class="request-table animate-fade-in modern-table"
            >
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
                <tr
                  *ngFor="let r of richieste"
                  [class.selected-row]="
                    r._id === modificaRichiestaData._id && showModaleModifica
                  "
                >
                  <td>{{ r.dataRichiesta | date : 'short' }}</td>
                  <td>{{ r.categoriaID.descrizione }}</td>
                  <td>{{ r.oggetto }}</td>
                  <td>{{ r.quantita }}</td>
                  <td>{{ r.costoUnitario | currency : 'EUR' }}</td>
                  <td>{{ r.motivazione }}</td>
                  <td>{{ r.stato }}</td>
                  <td>
                    <div class="table-actions">
                      <button
                        *ngIf="r.stato === 'In attesa'"
                        (click)="apriModaleModifica(r)"
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- MODALE MODIFICA RICHIESTA -->
          <div
            class="modal-overlay"
            *ngIf="showModaleModifica"
            role="dialog"
            aria-modal="true"
            aria-label="Modifica richiesta"
          >
            <div class="modal-content animate-fade-in">
              <h3>Modifica Richiesta</h3>
              <form
                (ngSubmit)="confermaModificaRichiesta()"
                #modificaForm="ngForm"
                class="request-form"
              >
                <div class="form-group">
                  <label for="categoriaMod">Categoria</label>
                  <select
                    id="categoriaMod"
                    name="categoriaMod"
                    [(ngModel)]="modificaRichiestaData.categoriaID"
                    required
                    class="form-control"
                    #categoriaModCtrl="ngModel"
                  >
                    <option value="">Seleziona categoria</option>
                    <option *ngFor="let cat of categorie" [value]="cat._id">
                      {{ cat.descrizione }}
                    </option>
                  </select>
                  <div
                    class="invalid-feedback"
                    *ngIf="categoriaModCtrl.invalid && categoriaModCtrl.touched"
                  >
                    Seleziona una categoria.
                  </div>
                </div>
                <div class="form-group">
                  <label for="oggettoMod">Oggetto</label>
                  <input
                    id="oggettoMod"
                    name="oggettoMod"
                    [(ngModel)]="modificaRichiestaData.oggetto"
                    required
                    class="form-control"
                    #oggettoModCtrl="ngModel"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="oggettoModCtrl.invalid && oggettoModCtrl.touched"
                  >
                    Inserisci l'oggetto della richiesta.
                  </div>
                </div>
                <div class="form-group">
                  <label for="quantitaMod">Quantità</label>
                  <input
                    id="quantitaMod"
                    name="quantitaMod"
                    type="number"
                    [(ngModel)]="modificaRichiestaData.quantita"
                    required
                    min="1"
                    class="form-control"
                    #quantitaModCtrl="ngModel"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="quantitaModCtrl.invalid && quantitaModCtrl.touched"
                  >
                    Inserisci una quantità valida (minimo 1).
                  </div>
                </div>
                <div class="form-group">
                  <label for="costoUnitarioMod">Costo Unitario</label>
                  <input
                    id="costoUnitarioMod"
                    name="costoUnitarioMod"
                    type="number"
                    [(ngModel)]="modificaRichiestaData.costoUnitario"
                    required
                    min="0"
                    class="form-control"
                    #costoUnitarioModCtrl="ngModel"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      costoUnitarioModCtrl.invalid &&
                      costoUnitarioModCtrl.touched
                    "
                  >
                    Inserisci un costo unitario valido (>= 0).
                  </div>
                </div>
                <div class="form-group">
                  <label for="motivazioneMod">Motivazione</label>
                  <input
                    id="motivazioneMod"
                    name="motivazioneMod"
                    [(ngModel)]="modificaRichiestaData.motivazione"
                    required
                    class="form-control"
                    #motivazioneModCtrl="ngModel"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      motivazioneModCtrl.invalid && motivazioneModCtrl.touched
                    "
                  >
                    Inserisci la motivazione della richiesta.
                  </div>
                </div>
                <div class="modal-actions">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!modificaForm.form.valid"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    (click)="chiudiModaleModifica()"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
          <!-- FINE MODALE MODIFICA RICHIESTA -->
        </ng-container>

        <!-- Responsabile: Elenco richieste da approvare e gestione categorie -->
        <ng-container *ngIf="currentUser?.ruolo === 'Responsabile'">
          <div class="section">
            <h2>Tutte le Richieste</h2>
            <div *ngIf="richiesteDaApprovare.length === 0" class="no-data">
              Nessuna richiesta trovata.
            </div>
            <div class="requests-grid">
              <div
                *ngFor="let r of richiesteDaApprovare"
                class="request-card animate-fade-in"
              >
                <div class="request-header">
                  <span class="request-date">{{
                    r.dataRichiesta | date : 'short'
                  }}</span>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-attesa': r.stato === 'In attesa',
                      'badge-approvata': r.stato === 'Approvata',
                      'badge-rifiutata': r.stato === 'Rifiutata'
                    }"
                    >{{ r.stato }}</span
                  >
                </div>
                <div class="request-body">
                  <div>
                    <strong>Categoria:</strong> {{ r.categoriaID.descrizione }}
                  </div>
                  <div><strong>Oggetto:</strong> {{ r.oggetto }}</div>
                  <div><strong>Quantità:</strong> {{ r.quantita }}</div>
                  <div>
                    <strong>Costo Unitario:</strong>
                    {{ r.costoUnitario | currency : 'EUR' }}
                  </div>
                  <div><strong>Motivazione:</strong> {{ r.motivazione }}</div>
                  <div>
                    <strong>Richiedente:</strong>
                    {{ r.utenteID?.nome || r.utenteID }}
                  </div>
                </div>
                <div class="request-actions">
                  <button
                    *ngIf="r.stato === 'In attesa'"
                    (click)="approvaRichiesta(r._id)"
                    class="btn btn-success animate-btn"
                  >
                    Approva
                  </button>
                  <button
                    *ngIf="r.stato === 'In attesa'"
                    (click)="rifiutaRichiesta(r._id)"
                    class="btn btn-danger animate-btn"
                  >
                    Rifiuta
                  </button>
                  <button
                    (click)="eliminaRichiesta(r._id)"
                    class="btn btn-secondary animate-btn"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="section categorie-section">
            <h2>Gestione Categorie</h2>
            <div class="category-form-card">
              <form
                (ngSubmit)="aggiungiCategoria()"
                #categoriaForm="ngForm"
                class="category-form"
              >
                <div class="form-group">
                  <label for="nuovaCategoria">Nuova Categoria</label>
                  <input
                    id="nuovaCategoria"
                    name="nuovaCategoria"
                    [(ngModel)]="nuovaCategoria"
                    required
                    class="form-control"
                    #nuovaCategoriaCtrl="ngModel"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      nuovaCategoriaCtrl.invalid && nuovaCategoriaCtrl.touched
                    "
                  >
                    Inserisci una descrizione valida.
                  </div>
                </div>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="!categoriaForm.form.valid"
                >
                  Aggiungi
                </button>
              </form>
            </div>
            <div class="category-grid">
              <div
                class="category-card animate-fade-in"
                *ngFor="let cat of categorie"
              >
                <span class="category-label">{{ cat.descrizione }}</span>
                <div class="category-actions">
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
                </div>
              </div>
            </div>
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
      .requests-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
        margin-top: 24px;
      }
      .request-card {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: box-shadow 0.3s, transform 0.3s;
        animation: fadeIn 0.7s;
      }
      .request-card:hover {
        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.18);
        transform: translateY(-4px) scale(1.02);
      }
      .request-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .badge {
        padding: 6px 16px;
        border-radius: 12px;
        font-size: 0.95em;
        font-weight: 600;
        color: #fff;
        letter-spacing: 0.5px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
      }
      .badge-attesa {
        background: #ffc107;
        color: #212529;
      }
      .badge-approvata {
        background: #28a745;
      }
      .badge-rifiutata {
        background: #dc3545;
      }
      .request-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      .animate-fade-in {
        animation: fadeIn 0.7s;
      }
      .animate-btn {
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .animate-btn:hover {
        transform: scale(1.07);
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      @media (max-width: 600px) {
        .dashboard-header,
        .section {
          padding: 12px !important;
        }
        .requests-grid {
          grid-template-columns: 1fr;
        }
        .request-card {
          padding: 14px;
        }
      }
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      .modal-content {
        background: #fff;
        border-radius: 16px;
        padding: 32px 24px 24px 24px;
        min-width: 320px;
        max-width: 95vw;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        animation: fadeIn 0.3s;
      }
      .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 18px;
        justify-content: flex-end;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* CSS aggiuntivo per feedback visivi */
      .invalid-feedback {
        color: #e53935;
        font-size: 13px;
        margin-top: 2px;
        margin-bottom: 6px;
        display: block;
      }
      input.ng-invalid.ng-touched,
      select.ng-invalid.ng-touched {
        border-color: #e53935;
        background: #fff6f6;
      }
      .spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
      }
      .spinner {
        border: 6px solid #eee;
        border-top: 6px solid #667eea;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .selected-row {
        background: #f3f7ff !important;
        transition: background 0.3s;
      }
      .btn,
      .btn-primary,
      .btn-warning,
      .btn-danger,
      .btn-secondary {
        transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
        outline: none;
      }
      .btn:focus,
      .btn-primary:focus,
      .btn-warning:focus,
      .btn-danger:focus,
      .btn-secondary:focus {
        box-shadow: 0 0 0 3px #b3c6ff;
        border-color: #667eea;
      }
      .btn:hover,
      .btn-primary:hover,
      .btn-warning:hover,
      .btn-danger:hover,
      .btn-secondary:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }
      .request-card {
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .request-card:hover {
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
        transform: translateY(-2px) scale(1.03);
      }
      .categorie-section {
        margin-top: 40px;
      }
      .category-form-card {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
        padding: 24px 20px 18px 20px;
        margin-bottom: 24px;
        max-width: 420px;
      }
      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }
      .category-card {
        background: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 1px 6px rgba(102, 126, 234, 0.07);
        padding: 18px 16px 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 56px;
      }
      .category-label {
        font-weight: 500;
        font-size: 1.08em;
        color: #333;
      }
      .category-actions {
        display: flex;
        gap: 8px;
      }
      .modern-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
        overflow: hidden;
        margin-top: 18px;
      }
      .modern-table th {
        background: #f3f7ff;
        font-weight: 600;
        padding: 16px 10px;
        border-bottom: 2px solid #e3e8f0;
        position: sticky;
        top: 0;
        z-index: 1;
      }
      .modern-table td {
        padding: 14px 10px;
        border-bottom: 1px solid #f0f0f0;
      }
      .modern-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      .modern-table tr:last-child td {
        border-bottom: none;
      }
      .table-actions {
        display: flex;
        gap: 8px;
      }
      .section + .section {
        margin-top: 40px;
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
  showModaleModifica = false;
  modificaRichiestaData: any = {
    _id: '',
    categoriaID: '',
    oggetto: '',
    quantita: 1,
    costoUnitario: 0,
    motivazione: '',
  };
  // Responsabile
  richiesteDaApprovare: RichiestaAcquisto[] = [];
  categorie: CategoriaAcquisto[] = [];
  nuovaCategoria: string = '';
  // 1. Spinner di loading
  loading = false;

  constructor(
    private authService: AuthService,
    private richiestaService: RichiestaAcquistoService,
    private categoriaService: CategoriaAcquistoService,
    private errorHandler: ErrorHandlerService
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
      this.errorHandler.handleError({
        error: { message: 'Compila tutti i campi' },
      });
      return;
    }
    this.loading = true;
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
        this.errorHandler.showSuccess('Richiesta creata con successo');
        this.loading = false;
      },
      error: (err) => {
        this.errorHandler.handleError(err);
        this.loading = false;
      },
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
        next: () => {
          this.loadRichiesteDipendente();
          this.errorHandler.showSuccess('Richiesta eliminata con successo');
        },
        error: (err) => this.errorHandler.handleError(err),
      });
    }
  }

  apriModaleModifica(r: RichiestaAcquisto) {
    this.modificaRichiestaData = {
      _id: r._id,
      categoriaID:
        typeof r.categoriaID === 'object' ? r.categoriaID._id : r.categoriaID,
      oggetto: r.oggetto,
      quantita: r.quantita,
      costoUnitario: r.costoUnitario,
      motivazione: r.motivazione,
    };
    this.showModaleModifica = true;
  }
  chiudiModaleModifica() {
    this.showModaleModifica = false;
    this.modificaRichiestaData = {
      _id: '',
      categoriaID: '',
      oggetto: '',
      quantita: 1,
      costoUnitario: 0,
      motivazione: '',
    };
  }
  confermaModificaRichiesta() {
    if (!this.modificaRichiestaData._id) return;
    this.loading = true;
    this.richiestaService
      .aggiornaRichiesta(this.modificaRichiestaData._id, {
        categoriaID: this.modificaRichiestaData.categoriaID,
        oggetto: this.modificaRichiestaData.oggetto,
        quantita: this.modificaRichiestaData.quantita,
        costoUnitario: this.modificaRichiestaData.costoUnitario,
        motivazione: this.modificaRichiestaData.motivazione,
      })
      .subscribe({
        next: () => {
          this.loadRichiesteDipendente();
          this.chiudiModaleModifica();
          this.errorHandler.showSuccess('Richiesta modificata con successo');
          this.loading = false;
        },
        error: (err) => {
          this.errorHandler.handleError(err);
          this.loading = false;
        },
      });
  }

  // --- Responsabile ---
  loadRichiesteDaApprovare() {
    this.richiestaService.getRichiesteDaApprovare().subscribe({
      next: (data) => {
        this.richiesteDaApprovare = data;
      },
      error: (err) => this.errorHandler.handleError(err),
    });
  }

  approvaRichiesta(id?: string) {
    if (!id) return;
    if (confirm('Approvare questa richiesta?')) {
      this.richiestaService.approvaRichiesta(id).subscribe({
        next: () => {
          this.loadRichiesteDaApprovare();
          this.errorHandler.showSuccess('Richiesta approvata con successo');
        },
        error: (err) => this.errorHandler.handleError(err),
      });
    }
  }

  rifiutaRichiesta(id?: string) {
    if (!id) return;
    if (confirm('Rifiutare questa richiesta?')) {
      this.richiestaService.rifiutaRichiesta(id).subscribe({
        next: () => {
          this.loadRichiesteDaApprovare();
          this.errorHandler.showSuccess('Richiesta rifiutata');
        },
        error: (err) => this.errorHandler.handleError(err),
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
          this.errorHandler.showSuccess('Categoria aggiunta con successo');
        },
        error: (err) => this.errorHandler.handleError(err),
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
          next: () => {
            this.loadCategorie();
            this.errorHandler.showSuccess('Categoria modificata con successo');
          },
          error: (err) => this.errorHandler.handleError(err),
        });
    }
  }

  eliminaCategoria(id?: string) {
    if (!id) return;
    if (confirm('Eliminare questa categoria?')) {
      this.categoriaService.eliminaCategoria(id).subscribe({
        next: () => {
          this.loadCategorie();
          this.errorHandler.showSuccess('Categoria eliminata con successo');
        },
        error: (err) => this.errorHandler.handleError(err),
      });
    }
  }
}
