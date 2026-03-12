import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-auth-modal',
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @modalAnimation>
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative glass-panel w-full max-w-md rounded-2xl p-8 border border-white/10 transform transition-all">
        <button (click)="close.emit()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black">
            S
          </div>
          <h2 class="text-2xl font-bold">{{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>
          <p class="text-gray-400 mt-2">
            {{ mode === 'login' ? 'Enter your credentials to access your account' : 'Sign up to start trading today' }}
          </p>
        </div>

        <form class="space-y-4" (ngSubmit)="onSubmit()">
          <div *ngIf="mode === 'register'">
            <label class="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="John Doe">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="you@example.com">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="••••••••">
          </div>

          <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-[1.02]">
            {{ mode === 'login' ? 'Sign In' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-400">
          {{ mode === 'login' ? "Don't have an account?" : "Already have an account?" }}
          <button (click)="toggleMode()" class="text-green-400 hover:text-green-300 font-medium ml-1">
            {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuthModalComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() close = new EventEmitter<void>();

  name = '';
  email = '';
  password = '';

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  onSubmit(): void {
    // Logic dyal l-auth hna
    console.log('Submit:', { mode: this.mode, name: this.name, email: this.email, password: this.password });
  }
}
