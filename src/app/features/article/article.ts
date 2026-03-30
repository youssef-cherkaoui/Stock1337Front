import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Departement } from '../../shared/models/departement.model';
import { StockService } from '../../services/stock';
import { ArticlesService } from '../../services/articles';
import { DepartementsService } from '../../services/departements';
import { AuthService } from '../../services/AuthService';
import { Article, ArticleRequest } from '../../shared/models/article.model';
import { Stock } from '../../shared/models/stock.model';
import * as THREE from 'three';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './article.html',
  styleUrls: ['./article.css'],
})
export class ArticleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;

  articles: Article[] = [];
  stocks: Stock[] = [];
  departements: Departement[] = [];
  isAdmin = false;
  showAddForm = false;
  articleForm: FormGroup;
  historyData: any[] = [];
  loading = false;

  currentTime: string = '';


  deletingArticle: Article | null = null;
  deleteLoading = false;

  editingArticle: Article | null = null;

  private donutChart!: Chart;
  private barChart!: Chart;
  private lineChart!: Chart;
  private chartsInitialized = false;
  private apiUrl = 'http://localhost:8087/api/v1/auth';

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticlesService,
    private stockService: StockService,
    private deptService: DepartementsService,
    private authService: AuthService,
    private http: HttpClient,
    private router : Router
  ) {
    this.articleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      minThreshold: [5],
      stockId: ['', Validators.required],
      departementId: ['', Validators.required]
    });
  }


  submitForm(): void {
    if (this.articleForm.invalid) return;
    const request: ArticleRequest = this.articleForm.value;

    if (this.editingArticle) {
      // UPDATE
      this.articleService.updateArticle(this.editingArticle.id, request).subscribe({
        next: () => {
          this.loadArticles();
          this.closeForm();
        },
        error: (err) => console.error('Update article error:', err)
      });
    } else {
      // CREATE
      this.articleService.addArticle(request).subscribe({
        next: () => {
          this.loadArticles();
          this.closeForm();
        },
        error: (err) => console.error('Add article error:', err)
      });
    }
  }

  openDeleteConfirm(article: Article): void {
    this.deletingArticle = article;
  }

  cancelDelete(): void {
    this.deletingArticle = null;
    this.deleteLoading = false;
  }

  confirmDelete(): void {
    if (!this.deletingArticle) return;
    this.deleteLoading = true;
    this.articleService.deleteArticle(this.deletingArticle.id).subscribe({
      next: () => {
        this.loadArticles();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Delete article error:', err);
        this.deleteLoading = false;
      }
    });
  }

  // ═══ Form Management ═════════════════════════════════

  /** Ouvre le formulaire d'ajout */
  openAddForm(): void {
    this.editingArticle = null;
    this.articleForm.reset({
      name: '',
      description: '',
      quantity: 0,
      minThreshold: 5,
      stockId: '',
      departementId: ''
    });
    this.showAddForm = true;
  }

  /** Ouvre le formulaire d'édition avec les données de l'article */
  openEditForm(article: Article): void {
    this.editingArticle = article;
    this.articleForm.patchValue({
      name: article.name,
      description: article.description || '',
      quantity: article.quantity,
      minThreshold: article.minThreshold,
      stockId: article.stock?.id || '',
      departementId: article.departement?.id || ''
    });
    this.showAddForm = true;
  }

  /** Ferme le formulaire (ajout ou édition) */
  closeForm(): void {
    this.showAddForm = false;
    this.editingArticle = null;
    this.articleForm.reset({ minThreshold: 5 });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadArticles();
    if (this.isAdmin) {
      this.loadHistory();
    }
    this.stockService.getAllStocks().subscribe(data => this.stocks = data);
    this.deptService.getAllDepartements().subscribe(data => this.departements = data);

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    this.currentTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.donutChart) this.donutChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.lineChart) this.lineChart.destroy();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  // ─── Computed ───────────────────────────────
  get lowStockCount(): number {
    return this.articles.filter(a => a.quantity <= a.minThreshold).length;
  }

  get healthPct(): number {
    if (this.articles.length === 0) return 100;
    return Math.round(((this.articles.length - this.lowStockCount) / this.articles.length) * 100);
  }

  getQtyPct(article: Article): number {
    const max = Math.max(...this.articles.map(a => a.quantity), 1);
    return Math.min((article.quantity / max) * 100, 100);
  }

  // ─── Three.js Background ────────────────────
  private initThreeJS(): void {
    const canvas = this.threeCanvas.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Créer les particules
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0x10b981), // emerald
      new THREE.Color(0x06b6d4), // cyan
      new THREE.Color(0x8b5cf6), // violet
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    this.scene.add(this.particles);

    // Event listeners
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));

    this.animate();
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.particles.rotation.y += 0.0007;
    this.particles.rotation.x += 0.0003;

    this.camera.position.x += (this.mouseX * 0.4 - this.camera.position.x) * 0.04;
    this.camera.position.y += (-this.mouseY * 0.4 - this.camera.position.y) * 0.04;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  // ─── Charts ─────────────────────────────────
  private initCharts(): void {
    if (this.chartsInitialized) {
      this.updateCharts();
      return;
    }
    setTimeout(() => {
      this.initDonut();
      this.initBar();
      this.chartsInitialized = true;
    }, 150);
  }

  private initDonut(): void {
    if (!this.donutChartRef) return;
    const ctx = this.donutChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const normal = this.articles.length - this.lowStockCount;

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'Faible'],
        datasets: [{
          data: [normal || 0.1, this.lowStockCount || 0.1],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(244, 63, 94, 0.8)'],
          borderColor: ['#10b981', '#f43f5e'],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false } },
        animation: { duration: 800 }
      }
    });
  }

  private initBar(): void {
    if (!this.barChartRef) return;
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const top = [...this.articles]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top.map(a => a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name),
        datasets: [{
          label: 'Quantité',
          data: top.map(a => a.quantity),
          backgroundColor: top.map(a =>
            a.quantity <= a.minThreshold
              ? 'rgba(244, 63, 94, 0.7)'
              : 'rgba(16, 185, 129, 0.7)'
          ),
          borderColor: top.map(a =>
            a.quantity <= a.minThreshold ? '#f43f5e' : '#10b981'
          ),
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 20, 0.9)',
            titleColor: '#34d399',
            bodyColor: '#ccc',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#888',
              font: { family: 'Outfit', size: 10 }
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#888',
              font: { family: 'Outfit', size: 10 }
            },
            beginAtZero: true
          }
        },
        animation: { duration: 800 }
      }
    });
  }

  private initLineChart(history: any[]): void {
    if (!this.lineChartRef) return;
    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.lineChart) this.lineChart.destroy();

    // Grouper par date
    const grouped: { [key: string]: number } = {};
    history.forEach(h => {
      const date = new Date(h.recordedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
      grouped[date] = (grouped[date] || 0) + (h.quantity || 0);
    });

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Quantité sortie',
          data,
          borderColor: '#10b981',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#050508',
          pointBorderWidth: 2,
          pointRadius: labels.length > 10 ? 3 : 5,
          pointHoverRadius: labels.length > 10 ? 5 : 7,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 20, 0.9)',
            titleColor: '#34d399',
            bodyColor: '#ccc',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#888',
              font: { family: 'Outfit', size: 10 },
              maxTicksLimit: 10
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#888',
              font: { family: 'Outfit', size: 10 }
            },
            beginAtZero: true
          }
        },
        animation: { duration: 800 }
      }
    });
  }

  private updateCharts(): void {
    if (this.donutChart) {
      const normal = this.articles.length - this.lowStockCount;
      this.donutChart.data.datasets[0].data = [normal || 0.1, this.lowStockCount || 0.1];
      this.donutChart.update();
    }
    if (this.barChart) {
      const top = [...this.articles]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8);
      this.barChart.data.labels = top.map(a =>
        a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name
      );
      this.barChart.data.datasets[0].data = top.map(a => a.quantity);
      (this.barChart.data.datasets[0] as any).backgroundColor = top.map(a =>
        a.quantity <= a.minThreshold ? 'rgba(244, 63, 94, 0.7)' : 'rgba(16, 185, 129, 0.7)'
      );
      this.barChart.update();
    }
  }

  // ─── Data Loading ───────────────────────────
  loadArticles(): void {
    this.loading = true;
    this.articleService.searchArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.loading = false;
        this.initCharts();
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.loading = false;
      }
    });
  }

  private loadHistory(): void {
    this.http.get<any[]>(`${this.apiUrl}/history/recent`).subscribe({
      next: (history) => {
        console.log('History loaded:', history);
        this.historyData = history || [];
        setTimeout(() => this.initLineChart(this.historyData), 300);
      },
      error: (err) => {
        console.error('History load failed:', err);
        this.historyData = [];
      }
    });
  }

  // ─── Filters ──────────────────────────────────
  onStockFilter(event: any): void {
    const stockId = event.target.value;
    this.filterArticles(stockId ? parseInt(stockId) : undefined, undefined);
  }

  onDeptFilter(event: any): void {
    const deptId = event.target.value;
    this.filterArticles(undefined, deptId ? parseInt(deptId) : undefined);
  }

  filterArticles(stockId?: number, deptId?: number): void {
    this.loading = true;
    this.articleService.searchArticles(stockId, deptId).subscribe({
      next: (data) => {
        this.articles = data;
        this.loading = false;
        this.initCharts();
      },
      error: (err) => {
        console.error('Filter error:', err);
        this.loading = false;
      }
    });
  }

  // ─── CRUD Operations ────────────────────────
  addArticle(): void {
    if (this.articleForm.invalid) return;

    const request: ArticleRequest = this.articleForm.value;
    this.articleService.addArticle(request).subscribe({
      next: () => {
        this.loadArticles();
        this.showAddForm = false;
        this.articleForm.reset({ minThreshold: 5 });
      },
      error: (err) => console.error('Add article error:', err)
    });
  }

  demandeArticle(article: Article): void {
    console.log('Demande pour:', article.name);
  }
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard-admin']);
  }

  logout(): void {
    this.authService.logout();
    // or this.router.navigate(['/login']);
  }
}
