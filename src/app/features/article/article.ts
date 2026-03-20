import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  articles: Article[] = [];
  stocks: Stock[] = [];
  departements: Departement[] = [];
  isAdmin = false;
  showAddForm = false;
  articleForm: FormGroup;

  private donutChart!: Chart;
  private barChart!: Chart;
  private chartsInitialized = false;

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
    private authService: AuthService
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

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadArticles();
    this.stockService.getAllStocks().subscribe(data => this.stocks = data);
    this.deptService.getAllDepartements().subscribe(data => this.departements = data);
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

  // ─── Three.js ───────────────────────────────
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
    const palette = [
      new THREE.Color(0x10b981),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0x8b5cf6),
    ];

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
          backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(244,63,94,0.8)'],
          borderColor: ['#10b981', '#f43f5e'],
          borderWidth: 2, hoverOffset: 6,
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false } },
        animation: { duration: 800 },
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
            a.quantity <= a.minThreshold ? 'rgba(244,63,94,0.7)' : 'rgba(16,185,129,0.7)'
          ),
          borderColor: top.map(a =>
            a.quantity <= a.minThreshold ? '#f43f5e' : '#10b981'
          ),
          borderWidth: 1, borderRadius: 8, borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.9)',
            titleColor: '#34d399', bodyColor: '#ccc',
            borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1,
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#555', font: { family: 'Outfit', size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#555', font: { family: 'Outfit', size: 10 } }, beginAtZero: true }
        },
        animation: { duration: 800 },
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
      const top = [...this.articles].sort((a, b) => b.quantity - a.quantity).slice(0, 8);
      this.barChart.data.labels = top.map(a => a.name.length > 10 ? a.name.slice(0,10)+'…' : a.name);
      this.barChart.data.datasets[0].data = top.map(a => a.quantity);
      (this.barChart.data.datasets[0] as any).backgroundColor = top.map(a =>
        a.quantity <= a.minThreshold ? 'rgba(244,63,94,0.7)' : 'rgba(16,185,129,0.7)'
      );
      this.barChart.update();
    }
  }

  // ─── Data ────────────────────────────────────
  loadArticles(): void {
    this.articleService.searchArticles().subscribe(data => {
      this.articles = data;
      this.initCharts();
    });
  }

  onStockFilter(event: any): void {
    const stockId = event.target.value;
    this.filterArticles(stockId ? parseInt(stockId) : undefined, undefined);
  }

  onDeptFilter(event: any): void {
    const deptId = event.target.value;
    this.filterArticles(undefined, deptId ? parseInt(deptId) : undefined);
  }

  filterArticles(stockId?: number, deptId?: number): void {
    this.articleService.searchArticles(stockId, deptId).subscribe(data => {
      this.articles = data;
      this.initCharts();
    });
  }

  addArticle(): void {
    if (this.articleForm.invalid) return;
    const request: ArticleRequest = this.articleForm.value;
    this.articleService.addArticle(request).subscribe({
      next: () => {
        this.loadArticles();
        this.showAddForm = false;
        this.articleForm.reset({ minThreshold: 5 });
      },
      error: (err) => console.error(err)
    });
  }

  demandeArticle(article: Article): void {
    console.log('Demande pour:', article.name);
  }
}
