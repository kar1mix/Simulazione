import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoriaAcquisto {
  _id?: string;
  descrizione: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaAcquistoService {
  private apiUrl = environment.apiUrl + '/categorie';

  constructor(private http: HttpClient) {}

  getCategorie(): Observable<CategoriaAcquisto[]> {
    return this.http.get<CategoriaAcquisto[]>(this.apiUrl);
  }

  creaCategoria(categoria: CategoriaAcquisto): Observable<CategoriaAcquisto> {
    return this.http.post<CategoriaAcquisto>(this.apiUrl, categoria);
  }

  aggiornaCategoria(
    id: string,
    categoria: CategoriaAcquisto
  ): Observable<CategoriaAcquisto> {
    return this.http.put<CategoriaAcquisto>(`${this.apiUrl}/${id}`, categoria);
  }

  eliminaCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
