import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';


interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BackendResponse {
  token: string;
  user: Person;
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router) {
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserFromStorage(): any {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');

    if (token) {
      return {token, role, email, name};
    }
    return null;
  }

  login(email: string, password: string): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(`${this.apiUrl}/authenticate`, {
      email,
      password
    }).pipe(
        tap(response => {

          console.log(JSON.stringify(response));
          const user = response.user;
          const role = 'ROLE_' + user.role;
          // Save to localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', role);
          localStorage.setItem('email', user.email);
          if (user.name) {
            localStorage.setItem('name', user.name);
          }


          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next({
            token: response.token,
            role: role,
            email: user.email ,
            name: user.name
          });

          // Redirect based on role
          this.redirectBasedOnRole(role);
        })
      );
  }

  register(userData: any, isAdmin: boolean = false): Observable<BackendResponse> {
    const endpoint = isAdmin ? '/register/admin' : '/register/user';
    return this.http.post<BackendResponse>(`${this.apiUrl}${endpoint}`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');

    // Update BehaviorSubjects
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);

    this.router.navigate(['/']);
  }

  redirectBasedOnRole(role: string): void {
    console.log('Redirecting based on role:', role); // Debug

    if (role === 'ROLE_ADMIN') {
      this.router.navigate(['/admin/dashboard-admin']);
    } else if (role === 'ROLE_USER') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  isAdmin(): boolean {

    return localStorage.getItem('role') === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return localStorage.getItem('role') === 'ROLE_USER';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
