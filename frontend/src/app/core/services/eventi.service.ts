import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Evento {
  _id?: string;
  titolo: string;
  descrizione: string;
  data: string;
  luogo: string;
  postiDisponibili: number;
  organizzatore?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventiService {
  private apiUrl = `${environment.apiUrl}/eventi`;

  constructor(private http: HttpClient) {}

  getEventi(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getEvento(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  updateEvento(id: string, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  iscriviPartecipante(eventoId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventoId}/iscrivi`, {});
  }

  disiscriviPartecipante(eventoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventoId}/iscrivi`);
  }
}
