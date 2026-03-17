import {Component, Output, EventEmitter, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// @ts-ignore
import { AuthService } from '../../features/auth/services/auth.service';

interface User {
  name: string;
  role: 'USER' | 'ADMIN';
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="fixed top-0 left-0 w-full z-50 px-8 py-6 transition-all duration-300" id="navbar">
      <div class="max-w-[1920px] mx-auto flex justify-between items-center glass-nav rounded-full px-8 py-4">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-4 cursor-pointer group">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center font-black text-black text-2xl transform group-hover:rotate-12 transition-transform duration-500">
            1337
          </div>
          <div>
            <span class="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">STOCK1337</span>
            <div class="text-xs font-medium text-emerald-400 tracking-widest uppercase">Inventory System</div>
          </div>
        </a>

        <!-- Navigation -->
        <div class="hidden lg:flex items-center gap-10">
          <a routerLink="/dashboard" class="nav-link text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-all">Dashboard</a>
          <a routerLink="/departements" class="nav-link text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-all">Départements</a>
          <a routerLink="/equipements" class="nav-link text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-all">Équipements</a>
          <a routerLink="/rapports" class="nav-link text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-all">Analytics</a>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-4">
          <ng-container *ngIf="!isLoggedIn">
            <button (click)="openAuth.emit('login')" class="text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-all">
              Connexion
            </button>
            <button (click)="openAuth.emit('register')" class="glow-button bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-6 py-3 rounded-full text-sm hover:shadow-lg transition-all transform hover:scale-105">
              Inscription
            </button>
          </ng-container>

          <ng-container *ngIf="isLoggedIn">
            <div class="flex items-center gap-3 glass-pill px-4 py-2 rounded-full">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold text-sm">
                {{ userInitials }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ userName }}</span>
                <span class="text-[10px] text-emerald-400 uppercase tracking-wider">{{ userRole }}</span>
              </div>
            </div>
            <button (click)="logout()" class="text-sm font-bold tracking-widest uppercase text-rose-400 hover:text-rose-300 transition-all">
              Déconnexion
            </button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .glass-nav {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .glass-pill {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glow-button {
      position: relative;
      overflow: hidden;
    }
    .nav-link {
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #34d399, #22d3ee);
      transition: width 0.3s;
    }
    .nav-link:hover::after {
      width: 100%;
    }
  `]
})
export class NavbarComponent implements OnInit {
  @Output() openAuth = new EventEmitter<'login' | 'register'>();

  isLoggedIn = false;
  userName = '';
  userRole: 'USER' | 'ADMIN' | '' = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  get userInitials(): string {
    return this.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  ngOnInit() {
    // @ts-ignore
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.userName = user.name;
        this.userRole = user.role;
      } else {
        this.isLoggedIn = false;
        this.userName = '';
        this.userRole = '';
      }
    });
  }

  logout() {
    // @ts-ignore
    this.authService.logout();
  }
}
