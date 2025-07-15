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

export interface StatisticaRichiesta {
  mese: string;
  categoria: string;
  numeroRichieste: number;
  costoTotale: number;
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

@Injectable({ providedIn: 'root' })
export class StatisticheRichiesteService {
  private apiUrl = environment.apiUrl + '/statistiche/richieste';

  constructor(private http: HttpClient) {}

  getStatistiche(
    mese?: string,
    categoria?: string
  ): Observable<StatisticaRichiesta[]> {
    let params = new HttpParams();
    if (mese) params = params.set('mese', mese);
    if (categoria) params = params.set('categoria', categoria);
    return this.http.get<StatisticaRichiesta[]>(this.apiUrl, { params });
  }
}
