import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckIn {
  _id: string;
  evento: string;
  utente: {
    _id: string;
    nome: string;
    email: string;
  };
  checkIn: boolean;
  dataCheckIn?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CheckInService {
  private apiUrl = `${environment.apiUrl}/check-in`;

  constructor(private http: HttpClient) {}

  effettuaCheckIn(eventoId: string, utenteId: string): Observable<CheckIn> {
    return this.http.post<CheckIn>(
      `${this.apiUrl}/${eventoId}/${utenteId}`,
      {}
    );
  }

  getCheckIn(eventoId: string): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.apiUrl}/${eventoId}`);
  }

  verificaCheckIn(eventoId: string, utenteId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${eventoId}/${utenteId}/verifica`
    );
  }
}
