import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  nome: string;
  cognome: string;
  email: string;
  iscrittoAlTorneo: boolean;
  organizzatoreDelTorneo: boolean;
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
      // Decodifica il token per ottenere le informazioni dell'utente
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          _id: payload.userId,
          nome: payload.nome || '',
          cognome: payload.cognome || '',
          email: payload.email,
          iscrittoAlTorneo: payload.iscrittoAlTorneo || false,
          organizzatoreDelTorneo: payload.organizzatoreDelTorneo || false,
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

  getUserRole(): string {
    const user = this.getCurrentUser();
    if (!user) return '';

    if (user.organizzatoreDelTorneo && user.iscrittoAlTorneo) {
      return 'both';
    } else if (user.organizzatoreDelTorneo) {
      return 'organizzatore';
    } else if (user.iscrittoAlTorneo) {
      return 'partecipante';
    } else {
      return 'utente';
    }
  }

  isOrganizzatore(): boolean {
    const user = this.getCurrentUser();
    return user?.organizzatoreDelTorneo || false;
  }

  isPartecipante(): boolean {
    const user = this.getCurrentUser();
    return user?.iscrittoAlTorneo || false;
  }

  canAccessApp(): boolean {
    const user = this.getCurrentUser();
    return user?.iscrittoAlTorneo || user?.organizzatoreDelTorneo || false;
  }

  // Metodo per ricaricare i dati dell'utente dal server
  reloadUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/utenti/profile`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  iscrizioneTorneo(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/utenti/iscrizione`, {}).pipe(
      tap((response: any) => {
        // Aggiorna il token se fornito nella risposta
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          // Ricarica i dati utente dal nuovo token
          this.loadStoredUser();
        }
      })
    );
  }

  diventaOrganizzatore(): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/utenti/diventa-organizzatore`, {})
      .pipe(
        tap((response: any) => {
          // Aggiorna il token se fornito nella risposta
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            // Ricarica i dati utente dal nuovo token
            this.loadStoredUser();
          }
        })
      );
  }
}
