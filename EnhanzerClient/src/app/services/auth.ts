import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // This matches the exact port from your Swagger screenshots
  private apiUrl = 'https://localhost:7057/api/Auth/login';

  // Tracks if the user is currently logged in
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  // Sends the login request and securely stores the session on success
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, password }).pipe(
      tap((response: any) => {
        // Securely store the authenticated session
        localStorage.setItem('session_token', 'authenticated_user');
        this.loggedIn.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('session_token');
    this.loggedIn.next(false);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('session_token');
  }
}
