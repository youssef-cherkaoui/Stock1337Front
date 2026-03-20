import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/AuthService';
import {HttpClient} from '@angular/common/http';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';



interface DashboardStats {
  totalUsers: number;
  totalStocks: number;
  totalArticles: number;
  totalDemandes: number;
  pendingDemandes: number;
  lowStockArticles: number;
}

interface RecentDemande {
  id: number;
  articleName: string;
  userName: string;
  quantity: number;
  status: string;
  date: string;
}

@Component({
  selector: 'app-admin-dashboard-cb',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard-cb.html',
  styleUrl: './admin-dashboard-cb.css',
})


export class AdminDashboardCbComponent implements OnInit {

  userName = '';
  userEmail = '';
  currentDate = new Date();

  stats: DashboardStats = {
    totalUsers: 0,
    totalStocks: 0,
    totalArticles: 0,
    totalDemandes: 0,
    pendingDemandes: 0,
    lowStockArticles: 0
  };

  recentDemandes: RecentDemande[] = [];
  loading = true;
  error = '';

  // API URLs
  private apiUrl = '/api/v1/auth';


  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadStats();
    this.loadRecentDemandes();
  }

  loadUserInfo(): void {
    this.userEmail = localStorage.getItem('email') || '';
    this.userName = localStorage.getItem('name') || this.userEmail.split('@')[0] || 'Admin';
  }

  getSelectValue(event: Event): string {
    const target = event.target as HTMLSelectElement;
    return target?.value || '';
  }

  loadStats(): void {
    // Load all data in parallel
    Promise.all([
      this.loadUsersCount(),
      this.loadStocksCount(),
      this.loadArticlesCount(),
      this.loadDemandesCount()
    ]).then(() => {
      this.loading = false;
    }).catch(err => {
      this.error = 'Erreur de chargement des statistiques';
      this.loading = false;
    });
  }

  async loadUsersCount(): Promise<void> {
    try {
      const users = await this.http.get<any[]>(`${this.apiUrl}/Admin/all`).toPromise() || [];
      this.stats.totalUsers = users.length;
    } catch (e) {
      console.error('Error loading users:', e);
      this.stats.totalUsers = 0;
    }
  }


  async loadStocksCount(): Promise<void> {
    try {
      const stocks = await this.http.get<any[]>(`${this.apiUrl}/stocks/all`).toPromise() || [];
      this.stats.totalStocks = stocks.length;
    } catch (e) {
      console.error('Error loading stocks:', e);
      this.stats.totalStocks = 0;
    }
  }

  async loadArticlesCount(): Promise<void> {
    try {
      const articles = await this.http.get<any[]>(`${this.apiUrl}/articles/search`).toPromise() || [];
      this.stats.totalArticles = articles.length;

      const lowStock = await this.http.get<any[]>(`${this.apiUrl}/articles/Low-Stock`).toPromise() || [];
      this.stats.lowStockArticles = lowStock.length;
    } catch (e) {
      console.error('Error loading articles:', e);
      this.stats.totalArticles = 0;
      this.stats.lowStockArticles = 0;
    }
  }

  async loadDemandesCount(): Promise<void> {
    try {
      const pending = await this.http.get<any[]>(`${this.apiUrl}/demandes/pending`).toPromise() || [];
      this.stats.pendingDemandes = pending.length;
      this.stats.totalDemandes = pending.length;
    } catch (e) {
      console.error('Error loading demandes:', e);
      this.stats.pendingDemandes = 0;
    }
  }

  loadRecentDemandes(): void {
    this.http.get<any[]>(`${this.apiUrl}/demandes/pending`).subscribe({
      next: (demandes) => {
        this.recentDemandes = (demandes || []).slice(0, 5).map(d => ({
          id: d.id,
          articleName: d.article?.name || 'Article inconnu',
          userName: d.user?.name || d.user?.email || 'Utilisateur',
          quantity: d.quantityRequired,
          status: d.statut,
          date: d.dateTime
        }));
      },
      error: (err) => {
        console.error('Error loading recent demandes:', err);
        this.recentDemandes = [];
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(path: string): void {
    this.router.navigate([`/admin/${path}`]);
  }

  approveDemande(id: number): void {
    this.http.put(`${this.apiUrl}/demandes/${id}/approve`, {}).subscribe({
      next: () => {
        this.loadStats();
        this.loadRecentDemandes();
      },
      error: (err) => alert('Erreur lors de l\'approbation')
    });
  }

  rejectDemande(id: number, cause: string): void {
    const params = { cause: cause };
    this.http.put(`${this.apiUrl}/demandes/${id}/reject`, null, { params }).subscribe({
      next: () => {
        this.loadStats();
        this.loadRecentDemandes();
      },
      error: (err) => alert('Erreur lors du refus')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


}
