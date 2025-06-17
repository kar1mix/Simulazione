import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  nome: string;
  ruolo: 'dipendente' | 'organizzatore';
}

export interface AuthResponse {
  token: string;
  id: string;
  nome: string;
  ruolo: 'dipendente' | 'organizzatore';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/utenti`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Recupera l'utente dal localStorage all'avvio
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(
    nome: string,
    email: string,
    password: string,
    ruolo: 'dipendente' | 'organizzatore'
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        nome,
        email,
        password,
        ruolo,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          const user: User = {
            id: response.id,
            nome: response.nome,
            ruolo: response.ruolo,
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          const user: User = {
            id: response.id,
            nome: response.nome,
            ruolo: response.ruolo,
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): 'dipendente' | 'organizzatore' | null {
    const user = this.currentUserSubject.value;
    return user ? user.ruolo : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
