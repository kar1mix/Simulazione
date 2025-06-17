import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Iscrizione {
  _id: string;
  eventoId: string;
  utenteId: string;
  dataIscrizione: string;
  checkIn: boolean;
  evento?: {
    titolo: string;
    data: string;
    luogo: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class IscrizioneService {
  private apiUrl = `${environment.apiUrl}/iscrizioni`;

  constructor(private http: HttpClient) {}

  iscrizione(eventoId: string): Observable<Iscrizione> {
    return this.http.post<Iscrizione>(this.apiUrl, { eventoId });
  }

  disiscrizione(eventoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventoId}`);
  }

  listaIscrizioni(): Observable<Iscrizione[]> {
    return this.http.get<Iscrizione[]>(`${this.apiUrl}/mie`);
  }

  checkIn(iscrizioneId: string): Observable<Iscrizione> {
    return this.http.put<Iscrizione>(
      `${this.apiUrl}/${iscrizioneId}/check-in`,
      {}
    );
  }
}
