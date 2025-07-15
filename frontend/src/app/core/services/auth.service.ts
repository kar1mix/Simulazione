import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'Dipendente' | 'Responsabile';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo?: 'Dipendente' | 'Responsabile';
}

export interface AuthResponse {
  message: string;
  token: string;
  utente: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          _id: payload.userId,
          nome: payload.nome || '',
          cognome: payload.cognome || '',
          email: payload.email,
          ruolo: payload.ruolo as 'Dipendente' | 'Responsabile',
        };
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Errore nel parsing del token:', error);
        this.logout();
      }
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/utenti/register`,
      userData
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/utenti/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          this.currentUserSubject.next(response.utente);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): 'Dipendente' | 'Responsabile' | '' {
    const user = this.getCurrentUser();
    return user?.ruolo || '';
  }

  // Metodo per ricaricare i dati dell'utente dal server
  reloadUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/utenti/profile`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }
}
