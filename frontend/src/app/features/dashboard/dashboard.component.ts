import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { TournamentService } from '../../core/services/torneo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <div class="welcome-header">
          <h1>
            Benvenuto, {{ currentUser?.nome }} {{ currentUser?.cognome }}!
          </h1>
          <button (click)="logout()" class="btn btn-logout">Logout</button>
        </div>
        <div class="user-status">
          <p>Email: {{ currentUser?.email }}</p>
          <p>Ruolo: {{ getUserRoleDisplay() }}</p>
        </div>
      </div>

      <!-- Sezione per utenti che non hanno ancora accesso -->
      <div *ngIf="!canAccessApp()" class="access-section">
        <h2>Accedi alle funzionalità del torneo</h2>
        <div class="access-buttons">
          <button
            *ngIf="!isPartecipante()"
            (click)="iscriviAlTorneo()"
            class="btn btn-primary"
          >
            Iscriviti al Torneo
          </button>
          <button
            *ngIf="!isOrganizzatore()"
            (click)="diventaOrganizzatore()"
            class="btn btn-secondary"
          >
            Diventa Organizzatore
          </button>
        </div>
      </div>

      <!-- Sezione per utenti con accesso -->
      <div *ngIf="canAccessApp()" class="main-content">
        <!-- Sezione per partecipanti che possono diventare organizzatori -->
        <div
          *ngIf="isPartecipante() && !isOrganizzatore()"
          class="upgrade-section"
        >
          <h3>Vuoi diventare organizzatore?</h3>
          <p>
            Come partecipante, puoi anche diventare organizzatore per gestire
            gli incontri.
          </p>
          <button (click)="diventaOrganizzatore()" class="btn btn-secondary">
            Diventa Organizzatore
          </button>
        </div>

        <!-- Sezione per organizzatori che possono diventare partecipanti -->
        <div
          *ngIf="isOrganizzatore() && !isPartecipante()"
          class="upgrade-section"
        >
          <h3>Vuoi partecipare al torneo?</h3>
          <p>
            Come organizzatore, puoi anche iscriverti come partecipante per
            giocare nel torneo.
          </p>
          <button (click)="iscriviAlTorneo()" class="btn btn-primary">
            Iscriviti al Torneo
          </button>
        </div>

        <!-- Sezione per utenti con ruolo "both" -->
        <div
          *ngIf="isOrganizzatore() && isPartecipante()"
          class="upgrade-section"
        >
          <h3>Hai accesso completo!</h3>
          <p>
            Sei sia partecipante che organizzatore. Puoi giocare nel torneo e
            gestire gli incontri.
          </p>
        </div>
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            [class.active]="activeTab === 'partecipanti'"
            (click)="setActiveTab('partecipanti')"
            class="tab-btn"
          >
            Partecipanti
          </button>
          <button
            [class.active]="activeTab === 'incontri'"
            (click)="setActiveTab('incontri')"
            class="tab-btn"
          >
            Incontri
          </button>
          <button
            [class.active]="activeTab === 'classifica'"
            (click)="setActiveTab('classifica')"
            class="tab-btn"
          >
            Classifica
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Tab Partecipanti -->
          <div *ngIf="activeTab === 'partecipanti'" class="tab-pane">
            <h3>Partecipanti al Torneo</h3>
            <div *ngIf="partecipanti.length === 0" class="no-data">
              Nessun partecipante iscritto al torneo.
            </div>
            <div *ngIf="partecipanti.length > 0" class="partecipanti-list">
              <div
                *ngFor="let partecipante of partecipanti"
                class="partecipante-item"
              >
                <span>{{ partecipante.nome }} {{ partecipante.cognome }}</span>
                <span class="email">{{ partecipante.email }}</span>
                <span
                  *ngIf="partecipante.organizzatoreDelTorneo"
                  class="badge organizer"
                >
                  Organizzatore
                </span>
              </div>
            </div>
          </div>

          <!-- Tab Incontri -->
          <div *ngIf="activeTab === 'incontri'" class="tab-pane">
            <h3>Gestione Incontri</h3>

            <!-- Form per creare nuovo incontro (solo organizzatori) -->
            <div *ngIf="isOrganizzatore()" class="create-match-section">
              <h4>Crea Nuovo Incontro</h4>
              <form
                (ngSubmit)="creaIncontro()"
                #matchForm="ngForm"
                class="match-form"
              >
                <div class="form-group">
                  <label for="giocatore1">Giocatore 1:</label>
                  <select
                    id="giocatore1"
                    name="giocatore1"
                    [(ngModel)]="nuovoIncontro.giocatore1"
                    required
                    class="form-control"
                  >
                    <option value="">Seleziona giocatore</option>
                    <option *ngFor="let p of partecipanti" [value]="p._id">
                      {{ p.nome }} {{ p.cognome }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="giocatore2">Giocatore 2:</label>
                  <select
                    id="giocatore2"
                    name="giocatore2"
                    [(ngModel)]="nuovoIncontro.giocatore2"
                    required
                    class="form-control"
                  >
                    <option value="">Seleziona giocatore</option>
                    <option *ngFor="let p of partecipanti" [value]="p._id">
                      {{ p.nome }} {{ p.cognome }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="dataIncontro">Data Incontro:</label>
                  <input
                    type="datetime-local"
                    id="dataIncontro"
                    name="dataIncontro"
                    [(ngModel)]="nuovoIncontro.dataIncontro"
                    required
                    class="form-control"
                  />
                </div>

                <button type="submit" class="btn btn-primary">
                  Crea Incontro
                </button>
              </form>
            </div>

            <!-- Lista incontri -->
            <div class="incontri-list">
              <h4>Incontri Programmati</h4>
              <div *ngIf="incontri.length === 0" class="no-data">
                Nessun incontro programmato.
              </div>
              <div *ngIf="incontri.length > 0" class="incontri-grid">
                <div *ngFor="let incontro of incontri" class="incontro-card">
                  <div class="incontro-header">
                    <h5>
                      {{ incontro.giocatore1.nome }}
                      {{ incontro.giocatore1.cognome }} vs
                      {{ incontro.giocatore2.nome }}
                      {{ incontro.giocatore2.cognome }}
                    </h5>
                    <span class="status" [class]="incontro.stato">
                      {{ incontro.stato }}
                    </span>
                  </div>
                  <div class="incontro-details">
                    <p>
                      Data:
                      {{ incontro.dataIncontro | date : 'dd/MM/yyyy HH:mm' }}
                    </p>
                    <p *ngIf="incontro.risultato">
                      Risultato: {{ incontro.risultato.punteggioGiocatore1 }} -
                      {{ incontro.risultato.punteggioGiocatore2 }}
                    </p>
                  </div>

                  <!-- Azioni per organizzatori -->
                  <div
                    *ngIf="
                      isOrganizzatore() && incontro.stato === 'programmato'
                    "
                    class="incontro-actions"
                  >
                    <button
                      (click)="registraRisultato(incontro._id)"
                      class="btn btn-sm btn-success"
                    >
                      Registra Risultato
                    </button>
                    <button
                      (click)="eliminaIncontro(incontro._id)"
                      class="btn btn-sm btn-danger"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Classifica -->
          <div *ngIf="activeTab === 'classifica'" class="tab-pane">
            <h3>Classifica del Torneo</h3>
            <div *ngIf="classifica.length === 0" class="no-data">
              Nessun dato disponibile per la classifica.
            </div>
            <div *ngIf="classifica.length > 0" class="classifica-table">
              <table>
                <thead>
                  <tr>
                    <th>Posizione</th>
                    <th>Giocatore</th>
                    <th>Partite Giocate</th>
                    <th>Vittorie</th>
                    <th>Sconfitte</th>
                    <th>Punti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let pos of classifica; let i = index">
                    <td>{{ i + 1 }}</td>
                    <td>
                      {{ pos.giocatore.nome }} {{ pos.giocatore.cognome }}
                    </td>
                    <td>{{ pos.partiteGiocate }}</td>
                    <td>{{ pos.vittorie }}</td>
                    <td>{{ pos.sconfitte }}</td>
                    <td>{{ pos.punti }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

      .welcome-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
      }

      .welcome-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .welcome-header h1 {
        margin: 0;
      }

      .btn-logout {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .welcome-section h1 {
        margin: 0 0 15px 0;
        font-size: 2.5em;
      }

      .user-status {
        font-size: 1.1em;
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

      .incontro-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        background: white;
      }

      .incontro-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .incontro-header h5 {
        margin: 0;
        color: #333;
      }

      .status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: 500;
      }

      .status.programmato {
        background: #ffc107;
        color: #212529;
      }

      .status.completato {
        background: #28a745;
        color: white;
      }

      .incontro-details p {
        margin: 5px 0;
        color: #6c757d;
      }

      .incontro-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
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
  activeTab = 'partecipanti';
  partecipanti: User[] = [];
  incontri: any[] = [];
  classifica: any[] = [];

  nuovoIncontro = {
    giocatore1: '',
    giocatore2: '',
    dataIncontro: '',
  };

  constructor(
    private authService: AuthService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      // Se non c'è un utente autenticato, reindirizza al login
      window.location.href = '/login';
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.loadPartecipanti();
    this.loadIncontri();
    this.loadClassifica();
  }

  loadPartecipanti(): void {
    this.tournamentService.getPartecipanti().subscribe({
      next: (data) => {
        this.partecipanti = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento partecipanti:', error);
      },
    });
  }

  loadIncontri(): void {
    this.tournamentService.getIncontri().subscribe({
      next: (data) => {
        this.incontri = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento incontri:', error);
      },
    });
  }

  loadClassifica(): void {
    this.tournamentService.getClassifica().subscribe({
      next: (data) => {
        this.classifica = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento classifica:', error);
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getUserRoleDisplay(): string {
    const role = this.authService.getUserRole();
    switch (role) {
      case 'both':
        return 'Partecipante e Organizzatore';
      case 'organizzatore':
        return 'Organizzatore';
      case 'partecipante':
        return 'Partecipante';
      case 'utente':
        return 'Utente';
      default:
        return 'Utente';
    }
  }

  canAccessApp(): boolean {
    return this.authService.canAccessApp();
  }

  isOrganizzatore(): boolean {
    return this.authService.isOrganizzatore();
  }

  isPartecipante(): boolean {
    return this.authService.isPartecipante();
  }

  iscriviAlTorneo(): void {
    this.authService.iscrizioneTorneo().subscribe({
      next: (response) => {
        console.log('Iscrizione effettuata:', response);
        // Ricarica il profilo utente dal server
        this.authService.reloadUserProfile().subscribe({
          next: (user) => {
            this.currentUser = user;
            this.loadData();
          },
          error: (error) => {
            console.error('Errore nel ricaricamento profilo:', error);
            this.currentUser = this.authService.getCurrentUser();
            this.loadData();
          },
        });
      },
      error: (error) => {
        console.error("Errore durante l'iscrizione:", error);
      },
    });
  }

  diventaOrganizzatore(): void {
    this.authService.diventaOrganizzatore().subscribe({
      next: (response) => {
        console.log('Promosso a organizzatore:', response);
        // Ricarica il profilo utente dal server
        this.authService.reloadUserProfile().subscribe({
          next: (user) => {
            this.currentUser = user;
            this.loadData();
          },
          error: (error) => {
            console.error('Errore nel ricaricamento profilo:', error);
            this.currentUser = this.authService.getCurrentUser();
            this.loadData();
          },
        });
      },
      error: (error) => {
        console.error('Errore durante la promozione:', error);
      },
    });
  }

  creaIncontro(): void {
    console.log('Tentativo di creazione incontro:', this.nuovoIncontro);

    if (
      !this.nuovoIncontro.giocatore1 ||
      !this.nuovoIncontro.giocatore2 ||
      !this.nuovoIncontro.dataIncontro
    ) {
      alert('Compila tutti i campi');
      return;
    }

    if (this.nuovoIncontro.giocatore1 === this.nuovoIncontro.giocatore2) {
      alert('I giocatori devono essere diversi');
      return;
    }

    console.log('Dati validi, invio richiesta...');
    this.tournamentService.creaIncontro(this.nuovoIncontro).subscribe({
      next: (response) => {
        console.log('Incontro creato:', response);
        alert('Incontro creato con successo!');
        this.nuovoIncontro = {
          giocatore1: '',
          giocatore2: '',
          dataIncontro: '',
        };
        this.loadIncontri();
      },
      error: (error) => {
        console.error('Errore nella creazione incontro:', error);
        alert(error.error?.message || "Errore nella creazione dell'incontro");
      },
    });
  }

  registraRisultato(incontroId: string): void {
    const punteggio1 = prompt('Inserisci il punteggio del primo giocatore:');
    const punteggio2 = prompt('Inserisci il punteggio del secondo giocatore:');

    if (punteggio1 && punteggio2) {
      const p1 = parseInt(punteggio1);
      const p2 = parseInt(punteggio2);

      if (isNaN(p1) || isNaN(p2) || p1 < 0 || p2 < 0) {
        alert('Inserisci punteggi validi (numeri >= 0)');
        return;
      }

      this.tournamentService.registraRisultato(incontroId, p1, p2).subscribe({
        next: (response) => {
          console.log('Risultato registrato:', response);
          this.loadIncontri();
          this.loadClassifica();
        },
        error: (error) => {
          console.error('Errore nella registrazione risultato:', error);
          alert(
            error.error?.message || 'Errore nella registrazione del risultato'
          );
        },
      });
    }
  }

  eliminaIncontro(incontroId: string): void {
    if (confirm('Sei sicuro di voler eliminare questo incontro?')) {
      this.tournamentService.eliminaIncontro(incontroId).subscribe({
        next: (response) => {
          console.log('Incontro eliminato:', response);
          this.loadIncontri();
        },
        error: (error) => {
          console.error("Errore nell'eliminazione incontro:", error);
        },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
