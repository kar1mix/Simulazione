import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
    this.caricaIscrizioni();
  }

  private caricaIscrizioni() {
    this.http.get<Iscrizione[]>(this.apiUrl).subscribe({
      next: (iscrizioni) => this.iscrizioniSubject.next(iscrizioni),
      error: (error) => console.error('Errore caricamento iscrizioni:', error),
    });
  }

  isIscritto(eventoId: string): boolean {
    return this.iscrizioniSubject.value.some((i) => i.evento === eventoId);
  }

  iscrivi(eventoId: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${eventoId}`, {})
      .pipe(tap(() => this.caricaIscrizioni()));
  }

  disiscrivi(eventoId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${eventoId}`)
      .pipe(tap(() => this.caricaIscrizioni()));
  }

  getIscrizioni(): Observable<Iscrizione[]> {
    return this.http.get<Iscrizione[]>(this.apiUrl);
  }
}
