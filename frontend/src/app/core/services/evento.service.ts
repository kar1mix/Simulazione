import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Evento {
  _id: string;
  titolo: string;
  descrizione: string;
  data: string;
  luogo: string;
  postiDisponibili: number;
  postiTotali: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private apiUrl = `${environment.apiUrl}/eventi`;

  constructor(private http: HttpClient) {}

  getEventi(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getEventoSingolo(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  createEvento(evento: Omit<Evento, '_id'>): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  updateEvento(id: string, evento: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
