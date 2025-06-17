import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Iscrizione {
  _id: string;
  evento: string;
  utente: string;
  dataIscrizione: string;
  checkIn: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class IscrizioniService {
  private apiUrl = `${environment.apiUrl}/iscrizioni`;
  private iscrizioniSubject = new BehaviorSubject<Iscrizione[]>([]);
  iscrizioni$ = this.iscrizioniSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carica le iscrizioni all'inizializzazione del servizio
    this.caricaIscrizioni().subscribe();
  }

  caricaIscrizioni(): Observable<Iscrizione[]> {
    return this.http.get<Iscrizione[]>(this.apiUrl).pipe(
      tap((iscrizioni) => {
        console.log('Iscrizioni caricate:', iscrizioni);
        this.iscrizioniSubject.next(iscrizioni);
      }),
      catchError((error) => {
        console.error('Errore nel caricamento delle iscrizioni:', error);
        return throwError(() => error);
      })
    );
  }

  isIscritto(eventoId: string): boolean {
    const iscrizioni = this.iscrizioniSubject.value;
    const isIscritto = iscrizioni.some((i) => i.evento === eventoId);
    console.log(`Verifica iscrizione evento ${eventoId}:`, isIscritto);
    return isIscritto;
  }

  iscrivi(eventoId: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { evento: eventoId }).pipe(
      tap(() => {
        console.log(`Iscrizione effettuata per evento ${eventoId}`);
        this.caricaIscrizioni().subscribe();
      }),
      catchError((error) => {
        console.error("Errore durante l'iscrizione:", error);
        return throwError(() => error);
      })
    );
  }

  disiscrivi(eventoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventoId}`).pipe(
      tap(() => {
        console.log(`Disiscrizione effettuata per evento ${eventoId}`);
        this.caricaIscrizioni().subscribe();
      }),
      catchError((error) => {
        console.error('Errore durante la disiscrizione:', error);
        return throwError(() => error);
      })
    );
  }

  getIscrizioni(): Observable<Iscrizione[]> {
    return this.http.get<Iscrizione[]>(this.apiUrl);
  }
}
