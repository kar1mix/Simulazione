import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getStatistiche(params: { dal: string; al: string }): Observable<Statistiche> {
    const httpParams = new HttpParams()
      .set('dal', params.dal)
      .set('al', params.al);

    return this.http.get<Statistiche>(this.apiUrl, { params: httpParams });
  }
}
