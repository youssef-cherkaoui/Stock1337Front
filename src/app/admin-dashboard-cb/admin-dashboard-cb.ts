import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../services/AuthService';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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

interface ArticleData {
  id: number;
  name: string;
  quantity: number;
  minThreshold: number;
  stock?: { name: string };
}

interface StockData {
  id: number;
  name: string;
  articles?: ArticleData[];
}

interface StockHistory {
  id: number;
  articleId: number;
  articleName: string;
  stockName: string;
  userName: string;
  quantityChange: number;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
  reason?: string;
  recordedAt: string;
}

interface HistoryStats {
  totalEntries: number;
  totalExits: number;
  totalAdjustments: number;
  totalMovements: number;
}

@Component({
  selector: 'app-admin-dashboard-cb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard-cb.html',
  styleUrl: './admin-dashboard-cb.css',
})
export class AdminDashboardCbComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  userName = '';
  userEmail = '';
  currentDate = new Date();

  stats: DashboardStats = {
    totalUsers: 0, totalStocks: 0, totalArticles: 0,
    totalDemandes: 0, pendingDemandes: 0, lowStockArticles: 0
  };

  recentDemandes: RecentDemande[] = [];
  lowStockArticles: ArticleData[] = [];
  stocksData: StockData[] = [];

  recentHistory: StockHistory[] = [];
  historyStats: HistoryStats = {
    totalEntries: 0,
    totalExits: 0,
    totalAdjustments: 0,
    totalMovements: 0
  };

  loading = true;
  error = '';

  sidebarOpen = false;

  get healthPct(): number {
    if (this.stats.totalArticles === 0) return 100;
    return Math.round(((this.stats.totalArticles - this.stats.lowStockArticles) / this.stats.totalArticles) * 100);
  }

  get healthColor(): string {
    if (this.healthPct >= 80) return '#10b981';
    if (this.healthPct >= 50) return '#f59e0b';
    return '#f43f5e';
  }

  get healthDash(): string {
    const circumference = 2 * Math.PI * 40;
    const filled = (this.healthPct / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth';
  private donutChart!: Chart;
  private barChart!: Chart;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.donutChart) this.donutChart.destroy();
    if (this.barChart) this.barChart.destroy();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  private initThreeJS(): void {
    const canvas = this.threeCanvas.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color(0x7c3aed), new THREE.Color(0xa855f7), new THREE.Color(0x00ccff)];

    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random()-0.5)*60;
      positions[i*3+1] = (Math.random()-0.5)*60;
      positions[i*3+2] = (Math.random()-0.5)*60;
      const c = palette[Math.floor(Math.random()*palette.length)];
      colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.028, vertexColors: true, transparent: true,
      opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.scene.add(this.particles);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = (e.clientX/window.innerWidth - 0.5)*2;
    this.mouseY = (e.clientY/window.innerHeight - 0.5)*2;
  }

  private onResize(): void {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.particles.rotation.y += 0.0007;
    this.particles.rotation.x += 0.0003;
    this.camera.position.x += (this.mouseX*0.4 - this.camera.position.x)*0.04;
    this.camera.position.y += (-this.mouseY*0.4 - this.camera.position.y)*0.04;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  loadUserInfo(): void {
    this.userEmail = localStorage.getItem('email') || '';
    this.userName = localStorage.getItem('name') || this.userEmail.split('@')[0] || 'Admin';
  }

  async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadUsers(),
        this.loadStocks(),
        this.loadArticles(),
        this.loadDemandes(),
        this.loadHistory(),
      ]);
      this.loading = false;
      setTimeout(() => this.initCharts(), 100);
    } catch {
      this.error = 'Erreur de chargement';
      this.loading = false;
    }
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.http.get<any[]>(`${this.apiUrl}/Admin/all`).toPromise() || [];
      this.stats.totalUsers = users.length;
    } catch { this.stats.totalUsers = 0; }
  }

  async loadStocks(): Promise<void> {
    try {
      const stocks = await this.http.get<StockData[]>(`${this.apiUrl}/stocks/all`).toPromise() || [];
      this.stats.totalStocks = stocks.length;
      this.stocksData = stocks;
    } catch { this.stats.totalStocks = 0; }
  }

  async loadArticles(): Promise<void> {
    try {
      const articles = await this.http.get<ArticleData[]>(`${this.apiUrl}/articles/search`).toPromise() || [];
      this.stats.totalArticles = articles.length;

      const lowStock = await this.http.get<ArticleData[]>(`${this.apiUrl}/articles/Low-Stock`).toPromise() || [];
      this.stats.lowStockArticles = lowStock.length;
      this.lowStockArticles = lowStock;
    } catch { this.stats.totalArticles = 0; }
  }

  async loadHistory(): Promise<void> {
    try {
      const history = await this.http.get<StockHistory[]>(`${this.apiUrl}/history/recent`).toPromise() || [];

      this.recentHistory = history.slice(0, 8).map(h => ({
        id: h.id,
        articleId: h.articleId,
        articleName: h.articleName || 'Article inconnu',
        stockName: h.stockName || 'Stock inconnu',
        userName: h.userName || 'Système',
        quantityChange: h.quantityChange || 0,
        type: h.type || 'AJUSTEMENT',
        reason: h.reason,
        recordedAt: h.recordedAt
      }));

      this.calculateHistoryStats(history);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      this.recentHistory = [];
      this.historyStats = { totalEntries: 0, totalExits: 0, totalAdjustments: 0, totalMovements: 0 };
    }
  }

  private calculateHistoryStats(history: StockHistory[]): void {
    let entries = 0;
    let exits = 0;
    let adjustments = 0;

    history.forEach(h => {
      switch (h.type) {
        case 'ENTREE':
          entries += Math.abs(h.quantityChange);
          break;
        case 'SORTIE':
          exits += Math.abs(h.quantityChange);
          break;
        case 'AJUSTEMENT':
          adjustments += 1;
          break;
      }
    });

    this.historyStats = {
      totalEntries: entries,
      totalExits: exits,
      totalAdjustments: adjustments,
      totalMovements: history.length
    };
  }

  getHistoryTypeClass(type: string): string {
    switch (type) {
      case 'ENTREE': return 'entree';
      case 'SORTIE': return 'sortie';
      case 'AJUSTEMENT': return 'ajustement';
      default: return '';
    }
  }

  getHistoryIcon(type: string): string {
    switch (type) {
      case 'ENTREE': return '📥';
      case 'SORTIE': return '📤';
      case 'AJUSTEMENT': return '⚖️';
      default: return '📝';
    }
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'À l\'instant' : `Il y a ${minutes} min`;
      }
      return `Il y a ${hours}h`;
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }

  async loadDemandes(): Promise<void> {
    try {
      const pending = await this.http.get<any[]>(`${this.apiUrl}/demandes/pending`).toPromise() || [];
      this.stats.pendingDemandes = pending.length;
      this.recentDemandes = pending.slice(0, 5).map(d => ({
        id: d.id,
        articleName: d.article?.name || 'Article inconnu',
        userName: d.user?.name || d.user?.email || 'Utilisateur',
        quantity: d.quantityRequired,
        status: d.statut,
        date: d.dateTime
      }));
    } catch { this.stats.pendingDemandes = 0; }
  }

  private initCharts(): void {
    this.initDonutChart();
    this.initBarChart();
  }

  private initDonutChart(): void {
    if (!this.donutChartRef) return;
    const ctx = this.donutChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const treated = Math.max(0, this.stats.totalArticles - this.stats.pendingDemandes);

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Traitées'],
        datasets: [{
          data: [this.stats.pendingDemandes || 1, treated || 1],
          backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)'],
          borderColor: ['#f59e0b', '#10b981'],
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        animation: { animateRotate: true, duration: 800 },
      }
    });
  }

  private initBarChart(): void {
    if (!this.barChartRef) return;
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Utilisateurs', 'Stocks', 'Articles', 'En attente', 'Stock Faible'];
    const data = [
      this.stats.totalUsers,
      this.stats.totalStocks,
      this.stats.totalArticles,
      this.stats.pendingDemandes,
      this.stats.lowStockArticles
    ];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Articles',
          data,
          backgroundColor: [
            'rgba(139,92,246,0.7)', 'rgba(6,182,212,0.7)', 'rgba(16,185,129,0.7)',
            'rgba(245,158,11,0.7)', 'rgba(244,63,94,0.7)', 'rgba(59,130,246,0.7)'
          ],
          borderColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'],
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.9)',
            titleColor: '#a78bfa',
            bodyColor: '#ccc',
            borderColor: 'rgba(139,92,246,0.3)',
            borderWidth: 1,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#555', font: { family: 'Outfit', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#555', font: { family: 'Outfit', size: 11 } },
            beginAtZero: true,
          }
        },
        animation: { duration: 800 },
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(path: string): void {
    if (path === 'history') {
      this.router.navigate(['/admin/history']);
    } else {
      this.router.navigate([`/admin/${path}`]);
    }

    if (window.innerWidth <= 992) {
      this.closeSidebar();
    }
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement)?.value || '';
  }

  approveDemande(id: number): void {
    this.http.put(`${this.apiUrl}/demandes/${id}/approve`, {}).subscribe({
      next: () => this.loadAllData()
    });
  }

  rejectDemande(id: number, cause: string): void {
    if (!cause) return;
    this.http.put(`${this.apiUrl}/demandes/${id}/reject`, null, { params: { cause } }).subscribe({
      next: () => this.loadAllData()
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
