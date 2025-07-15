import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoriaAcquisto {
  _id: string;
  descrizione: string;
}

export interface RichiestaAcquisto {
  _id: string;
  dataRichiesta: string;
  categoriaID: CategoriaAcquisto;
  oggetto: string;
  quantita: number;
  costoUnitario: number;
  motivazione: string;
  stato: 'In attesa' | 'Approvata' | 'Rifiutata';
  utenteID: string;
  dataApprovazione?: string;
  utenteApprovazioneID?: string;
}

export interface NuovaRichiesta {
  categoriaID: string;
  oggetto: string;
  quantita: number;
  costoUnitario: number;
  motivazione: string;
}

@Injectable({
  providedIn: 'root',
})
export class RichiestaAcquistoService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Richieste di acquisto
  getRichieste(): Observable<RichiestaAcquisto[]> {
    return this.http.get<RichiestaAcquisto[]>(`${this.apiUrl}/richieste`);
  }

  getRichiestaById(id: string): Observable<RichiestaAcquisto> {
    return this.http.get<RichiestaAcquisto>(`${this.apiUrl}/richieste/${id}`);
  }

  creaRichiesta(richiesta: NuovaRichiesta): Observable<RichiestaAcquisto> {
    return this.http.post<RichiestaAcquisto>(
      `${this.apiUrl}/richieste`,
      richiesta
    );
  }

  aggiornaRichiesta(
    id: string,
    richiesta: Partial<NuovaRichiesta>
  ): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(
      `${this.apiUrl}/richieste/${id}`,
      richiesta
    );
  }

  eliminaRichiesta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/richieste/${id}`);
  }

  getRichiesteDaApprovare(): Observable<RichiestaAcquisto[]> {
    return this.http.get<RichiestaAcquisto[]>(
      `${this.apiUrl}/richieste/da-approvare`
    );
  }

  approvaRichiesta(id: string): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(
      `${this.apiUrl}/richieste/${id}/approva`,
      {}
    );
  }

  rifiutaRichiesta(id: string): Observable<RichiestaAcquisto> {
    return this.http.put<RichiestaAcquisto>(
      `${this.apiUrl}/richieste/${id}/rifiuta`,
      {}
    );
  }

  // Categorie
  getCategorie(): Observable<CategoriaAcquisto[]> {
    return this.http.get<CategoriaAcquisto[]>(`${this.apiUrl}/categorie`);
  }

  creaCategoria(descrizione: string): Observable<CategoriaAcquisto> {
    return this.http.post<CategoriaAcquisto>(`${this.apiUrl}/categorie`, {
      descrizione,
    });
  }

  aggiornaCategoria(
    id: string,
    descrizione: string
  ): Observable<CategoriaAcquisto> {
    return this.http.put<CategoriaAcquisto>(`${this.apiUrl}/categorie/${id}`, {
      descrizione,
    });
  }

  eliminaCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorie/${id}`);
  }
}
