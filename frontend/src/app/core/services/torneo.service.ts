import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Partecipante {
  _id: string;
  nome: string;
  cognome: string;
  email: string;
  iscrittoAlTorneo: boolean;
  organizzatoreDelTorneo: boolean;
}

export interface Incontro {
  _id: string;
  giocatore1: Partecipante;
  giocatore2: Partecipante;
  dataIncontro: string;
  stato: 'programmato' | 'completato';
  risultato?: {
    punteggioGiocatore1: number;
    punteggioGiocatore2: number;
  };
}

export interface ClassificaItem {
  giocatore: Partecipante;
  partiteGiocate: number;
  vittorie: number;
  sconfitte: number;
  punti: number;
}

export interface NuovoIncontro {
  giocatore1: string;
  giocatore2: string;
  dataIncontro: string;
}

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private apiUrl = `${environment.apiUrl}/torneo`;

  constructor(private http: HttpClient) {}

  // Funzioni per ottenere dati
  getPartecipanti(): Observable<Partecipante[]> {
    return this.http.get<Partecipante[]>(`${this.apiUrl}/partecipanti`);
  }

  getIncontri(): Observable<Incontro[]> {
    return this.http.get<Incontro[]>(`${this.apiUrl}/incontri`);
  }

  getClassifica(): Observable<ClassificaItem[]> {
    return this.http.get<ClassificaItem[]>(`${this.apiUrl}/classifica`);
  }

  // Funzioni organizzatore
  creaIncontro(incontro: NuovoIncontro): Observable<Incontro> {
    return this.http.post<Incontro>(`${this.apiUrl}/incontri`, incontro);
  }

  registraRisultato(
    incontroId: string,
    punteggioGiocatore1: number,
    punteggioGiocatore2: number
  ): Observable<Incontro> {
    return this.http.put<Incontro>(
      `${this.apiUrl}/incontri/${incontroId}/risultato`,
      {
        punteggioGiocatore1,
        punteggioGiocatore2,
      }
    );
  }

  eliminaIncontro(incontroId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/incontri/${incontroId}`);
  }

  // Metodo per promuovere un utente a organizzatore (solo per organizzatori esistenti)
  promuoviOrganizzatore(userId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/utenti/promuovi-organizzatore/${userId}`,
      {}
    );
  }
}
