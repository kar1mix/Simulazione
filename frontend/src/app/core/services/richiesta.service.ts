import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RichiestaAcquisto {
  _id?: string;
  dataRichiesta?: string;
  categoriaID: any;
  oggetto: string;
  quantita: number;
  costoUnitario: number;
  motivazione: string;
  stato?: 'In attesa' | 'Approvata' | 'Rifiutata';
  utenteID?: any;
  dataApprovazione?: string;
  utenteApprovazioneID?: any;
}

@Injectable({ providedIn: 'root' })
export class RichiestaAcquistoService {
  private apiUrl = environment.apiUrl + '/richieste';

  constructor(private http: HttpClient) {}

  getRichieste(): Observable<RichiestaAcquisto[]> {
    return this.http.get<RichiestaAcquisto[]>(this.apiUrl);
  }

  getRichiesteDaApprovare(): Observable<RichiestaAcquisto[]> {
    return this.http.get<RichiestaAcquisto[]>(`${this.apiUrl}/da-approvare`);
  }

  creaRichiesta(richiesta: RichiestaAcquisto): Observable<RichiestaAcquisto> {
    return this.http.post<RichiestaAcquisto>(this.apiUrl, richiesta);
  }

  aggiornaRichiesta(
    id: string,
    richiesta: RichiestaAcquisto
  ): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(`${this.apiUrl}/${id}`, richiesta);
  }

  eliminaRichiesta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  approvaRichiesta(id: string): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(`${this.apiUrl}/${id}/approva`, {});
  }

  rifiutaRichiesta(id: string): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(`${this.apiUrl}/${id}/rifiuta`, {});
  }
}
