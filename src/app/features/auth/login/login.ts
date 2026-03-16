import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative glass-panel w-full max-w-md rounded-2xl p-8 border border-white/10 bg-gray-900">
        <button (click)="close.emit()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>

        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black">S</div>
          <h2 class="text-2xl font-bold">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
        </div>

        <form class="space-y-4" (ngSubmit)="onSubmit()">
          @if (!isLogin) {
            <input type="text" [(ngModel)]="name" name="name" placeholder="Full Name" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white">
          }
          <input type="email" [(ngModel)]="email" name="email" placeholder="Email" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white">
          <input type="password" [(ngModel)]="password" name="password" placeholder="Password" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white">

          <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold py-3 rounded-lg">
            {{ isLogin ? 'Sign In' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-400">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button (click)="toggleMode()" class="text-green-400 ml-1">{{ isLogin ? 'Sign up' : 'Sign in' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
    }
  `]
})
export class LoginComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() close = new EventEmitter<void>();

  isLogin = true;
  name = '';
  email = '';
  password = '';

  ngOnInit() {
    this.isLogin = this.mode === 'login';
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    console.log('Submit:', { isLogin: this.isLogin, name: this.name, email: this.email, password: this.password });
  }
}
