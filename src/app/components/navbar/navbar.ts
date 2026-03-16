import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 w-full z-40 px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3 cursor-pointer" routerLink="/">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">
            1337
          </div>
          <div>
            <span class="text-xl font-bold tracking-tight">Stock1337</span>
            <div class="text-xs text-gray-400">Gestion d'Inventaire</div>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a routerLink="/dashboard"
             routerLinkActive="text-green-400"
             class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Tableau de Bord</a>
          <a routerLink="/departements"
             routerLinkActive="text-green-400"
             class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Départements</a>
          <a routerLink="/equipements"
             routerLinkActive="text-green-400"
             class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Équipements</a>
          <a routerLink="/rapports"
             routerLinkActive="text-green-400"
             class="nav-link text-sm font-medium text-gray-300 hover:text-white transition-colors">Rapports</a>
        </div>

        <div class="flex items-center gap-4">
          <button (click)="openAuth.emit('login')" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Connexion
          </button>
          <button (click)="openAuth.emit('register')" class="glow-button bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold px-6 py-2 rounded-full text-sm hover:shadow-lg transition-all transform hover:scale-105">
            Admin
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .glow-button {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .glow-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .glow-button:hover::before {
      left: 100%;
    }
  `]
})
export class NavbarComponent {
  @Output() openAuth = new EventEmitter<'login' | 'register'>();
}
