import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="fixed top-10 left-0 w-full z-40 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center glass-panel rounded-full px-8 py-3">
        <div class="flex items-center gap-2 cursor-pointer">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">
            S
          </div>
          <span class="text-xl font-bold tracking-tight">StockPro</span>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a href="#" class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Markets</a>
          <a href="#" class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Trading</a>
          <a href="#" class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Analysis</a>
          <a href="#" class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
        </div>

        <div class="flex items-center gap-4">
          <button (click)="openAuth.emit('login')" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log In
          </button>
          <button (click)="openAuth.emit('register')" class="glow-button bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold px-6 py-2 rounded-full text-sm hover:shadow-lg transition-all transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Output() openAuth = new EventEmitter<'login' | 'register'>();
}
