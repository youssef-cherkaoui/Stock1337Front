import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeJsService } from '../../services/three-js.service';
import { LoginComponent } from '../../features/auth/login/login';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,  LoginComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  // Auth
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';
  isLoggedIn = false;
  userName = '';
  userRole: 'USER' | 'ADMIN' | '' = '';

  // Stats
  stats = [
    { value: '1,834', label: 'Total Équipements', gradient: 'from-emerald-400 to-cyan-400', percentage: 100 },
    { value: '1,245', label: 'Disponibles', gradient: 'from-cyan-400 to-blue-400', percentage: 68 },
    { value: '423', label: 'En Utilisation', gradient: 'from-amber-400 to-orange-400', percentage: 23 },
    { value: '166', label: 'Maintenance', gradient: 'from-rose-400 to-pink-400', percentage: 9 },
  ];

  // Activities
  activities = [
    { icon: '💻', title: 'PC-042 déplacé', desc: 'Pool → Cluster A', time: '2 min' },
    { icon: '🖱️', title: 'Souris signalée', desc: 'Défectueuse - Cluster B', time: '5 min' },
    { icon: '🔌', title: 'Câble HDMI ajouté', desc: 'Stock +15 unités', time: '12 min' },
    { icon: '🖥️', title: 'Écran 4K installé', desc: 'Salle de Réunion', time: '1h' },
  ];

  // Départements
  departements = [
    { initiale: 'P', nom: 'Pool', description: 'Espace de travail collaboratif haute performance', pcCount: 45, dispo: 38, occupe: 5, panne: 2, bg: 'bg-gradient-to-br from-emerald-400 to-cyan-400', glow: 'from-emerald-400 to-cyan-400' },
    { initiale: 'A', nom: 'Cluster A', description: 'Salle de projet avancée équipements pro', pcCount: 32, dispo: 28, occupe: 2, panne: 2, bg: 'bg-gradient-to-br from-cyan-400 to-blue-500', glow: 'from-cyan-400 to-blue-500' },
    { initiale: 'B', nom: 'Cluster B', description: 'Espace détente et créativité ergonomique', pcCount: 28, dispo: 25, occupe: 2, panne: 1, bg: 'bg-gradient-to-br from-violet-400 to-purple-500', glow: 'from-violet-400 to-purple-500' },
    { initiale: 'AD', nom: 'Administration', description: 'Bureaux administratifs et direction', pcCount: 12, dispo: 8, occupe: 3, panne: 1, bg: 'bg-gradient-to-br from-amber-400 to-orange-500', glow: 'from-amber-400 to-orange-500' },
    { initiale: 'R', nom: 'Salle de Réunion', description: 'Présentation 4K et conférences', pcCount: 8, dispo: 6, occupe: 1, panne: 1, bg: 'bg-gradient-to-br from-rose-400 to-pink-500', glow: 'from-rose-400 to-pink-500' },
    { initiale: 'F', nom: 'FabLab', description: 'Laboratoire prototypage impression 3D', pcCount: 15, dispo: 12, occupe: 2, panne: 1, bg: 'bg-gradient-to-br from-blue-400 to-indigo-500', glow: 'from-blue-400 to-indigo-500' },
  ];

  // Équipements
  equipements = [
    { id: 'PC-001', icon: '💻', type: 'PC', modele: 'Dell OptiPlex 7090 RTX', departement: 'Pool', statut: 'Disponible' },
    { id: 'PC-002', icon: '💻', type: 'PC', modele: 'Dell OptiPlex 7090 RTX', departement: 'Pool', statut: 'En utilisation' },
    { id: 'ECR-015', icon: '🖥️', type: 'Écran', modele: 'Dell UltraSharp 4K 32"', departement: 'Cluster A', statut: 'Disponible' },
    { id: 'SOUR-042', icon: '🖱️', type: 'Souris', modele: 'Logitech MX Master 3S', departement: 'Cluster B', statut: 'En réparation' },
    { id: 'CLAV-023', icon: '⌨️', type: 'Clavier', modele: 'Keychron Q1 Pro', departement: 'FabLab', statut: 'Disponible' },
    { id: 'CABL-156', icon: '🔌', type: 'Câble', modele: 'HDMI 2.1 4K@120Hz', departement: 'Stock', statut: 'Disponible' },
  ];

  // Analytics
  analytics = [
    { name: 'Pool', value: 35 },
    { name: 'Cluster A', value: 25 },
    { name: 'Cluster B', value: 20 },
    { name: 'FabLab', value: 12 },
    { name: 'Administration', value: 8 },
  ];

  get userInitials(): string {
    return this.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  constructor(private threeJsService: ThreeJsService) {}

  ngOnInit(): void {
    this.threeJsService.init(this.canvasContainer);
    this.checkAuth();
  }

  ngOnDestroy(): void {
    this.threeJsService.destroy();
  }

  checkAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.isLoggedIn = true;
        this.userName = userData.name;
        this.userRole = userData.role;
      } catch (e) {
        this.logout();
      }
    }
  }

  openAuth(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.showAuthModal = true;
  }

  closeAuth(): void {
    this.showAuthModal = false;
  }

  onAuthSuccess(): void {
    this.closeAuth();
    this.checkAuth();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userName = '';
    this.userRole = '';
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
}
