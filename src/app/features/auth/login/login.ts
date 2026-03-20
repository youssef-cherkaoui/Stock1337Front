import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient  } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80 backdrop-blur-xl" (click)="close.emit()"></div>

      <!-- Modal -->
      <div class="relative glass-modal w-full max-w-md rounded-3xl p-8 border border-white/10 transform transition-all">
        <button (click)="close.emit()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">✕</button>

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black text-black transform hover:rotate-12 transition-transform">
            1337
          </div>
          <h2 class="text-3xl font-black mb-2">
            {{ isLogin ? 'Connexion' : 'Inscription' }}
          </h2>
          <p class="text-gray-400 text-sm">
            {{ isLogin ? 'Accédez à votre compte' : 'Créez votre compte étudiant' }}
          </p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center">
          {{ successMessage }}
        </div>

        <!-- Form -->
        <form class="space-y-4" (ngSubmit)="onSubmit()">

          <!-- Name - Register Only -->
          <div *ngIf="!isLogin" class="relative">
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <input type="text" [(ngModel)]="name" name="name" placeholder="Nom complet" required
                   class="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors">
          </div>

          <!-- Email -->
          <div class="relative">
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
            </svg>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required
                   class="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors">
          </div>

          <!-- Password -->
          <div class="relative">
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Mot de passe" required
                   class="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors">
          </div>

          <!-- Confirm Password - Register Only -->
          <div *ngIf="!isLogin" class="relative">
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirmer le mot de passe" required
                   class="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors">
          </div>

          <!-- Submit Button -->
          <button type="submit" [disabled]="isLoading"
                  class="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <svg *ngIf="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Chargement...' : (isLogin ? 'Se Connecter' : 'Créer un Compte') }}
          </button>
        </form>

        <!-- Toggle -->
        <div class="mt-6 text-center text-sm text-gray-400">
          {{ isLogin ? "Pas encore de compte ?" : "Déjà un compte ?" }}
          <button (click)="toggleMode()" class="text-emerald-400 ml-1 font-bold hover:underline">
            {{ isLogin ? "S'inscrire" : "Se connecter" }}
          </button>
        </div>

        <!-- Note -->
        <div *ngIf="!isLogin" class="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 text-center">
          ⚠️ Inscription réservée aux étudiants 1337 uniquement
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-modal {
      background: rgba(20, 20, 20, 0.9);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class LoginComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() close = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<any>();

  isLogin = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';


  name = '';
  email = '';
  password = '';
  confirmPassword = '';


  private apiUrl = '/api/v1/auth';

  constructor(private http: HttpClient, private  router : Router) {}

  ngOnInit() {
    this.isLogin = this.mode === 'login';
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLogin) {
      this.doLogin();
    } else {
      this.doRegister();
    }
  }

  doLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`http://localhost:8087/api/v1/auth/authenticate`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        const user = response.user;
        const role = 'ROLE_' + user.role;

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', role);
        localStorage.setItem('email', user.email );
        if(response.name) {
          localStorage.setItem('name', user.name);
        }
        this.close.emit();

        if(role === 'ROLE_ADMIN' ) {
          console.log('redirect to admin dashboard');
          this.router.navigate(['/admin/dashboard-admin']);
        }
        else if (response.role === 'ROLE_USER') {
          this.router.navigate(['/user/dashboard']);
        }
        else {
          this.router.navigate(['dashboard']);
        }

      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
      }
    });
  }

  doRegister() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/register/user`, {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email || this.email);
        if (response.name) {
          localStorage.setItem('name', response.name);
        }

        this.close.emit();

        // Redirect after register
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard-admin']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}
