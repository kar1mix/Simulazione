import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/utenti';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('ruolo', res.ruolo);
          localStorage.setItem('nome', res.nome);
        }
      })
    );
  }

  register(
    nome: string,
    email: string,
    password: string,
    ruolo: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      nome,
      email,
      password,
      ruolo,
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('ruolo');
    localStorage.removeItem('nome');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRuolo(): string | null {
    return localStorage.getItem('ruolo');
  }

  getNome(): string | null {
    return localStorage.getItem('nome');
  }
}
