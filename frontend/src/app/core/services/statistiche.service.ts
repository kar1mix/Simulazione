import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Statistiche {
  totaleEventi: number;
  totaleIscrizioni: number;
  mediaPartecipanti: number;
  eventiPerMese: {
    mese: string;
    numeroEventi: number;
  }[];
  partecipantiPerEvento: {
    titolo: string;
    numeroPartecipanti: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class StatisticheService {
  private apiUrl = `${environment.apiUrl}/statistiche`;

  constructor(private http: HttpClient) {}

  getStatistiche(): Observable<Statistiche> {
    return this.http.get<Statistiche>(this.apiUrl);
  }
}
