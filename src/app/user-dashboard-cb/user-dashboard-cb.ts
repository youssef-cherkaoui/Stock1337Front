import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import * as THREE from 'three';
import {Article} from '../shared/models/article.model';
import {Demande} from '../shared/models/demande.model';
import {AuthService} from '../services/AuthService';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-dashboard-cb.html',
  styleUrls: ['./user-dashboard-cb.css'],
})
export class UserDashboardCB implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  // State
  activeTab: 'dashboard' | 'articles' | 'demandes' = 'dashboard';
  loading = true;
  currentDate = new Date();
  userName = '';

  // Data
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  myDemandes: Demande[] = [];
  searchQuery = '';
  demandeFilter = 'ALL';

  // Modal
  showModal = false;
  selectedArticle: Article | null = null;
  demandeQte = 1;
  saving = false;
  formError = '';

  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth';

  // Three.js
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
    this.userName = localStorage.getItem('name') ||
      (localStorage.getItem('email') || '').split('@')[0] || 'Utilisateur';
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  // ─── Computed ───────────────────────────────
  get pendingCount(): number { return this.myDemandes.filter(d => d.statut === 'EN_ATTENTE').length; }
  get acceptedCount(): number { return this.myDemandes.filter(d => d.statut === 'ACCEPTEE').length; }
  get rejectedCount(): number { return this.myDemandes.filter(d => d.statut === 'REFUSEE').length; }

  get filteredDemandes(): Demande[] {
    if (this.demandeFilter === 'ALL') return this.myDemandes;
    return this.myDemandes.filter(d => d.statut === this.demandeFilter);
  }

  getQtyPct(article: Article): number {
    const max = Math.max(...this.articles.map(a => a.quantity), 1);
    return Math.min((article.quantity / max) * 100, 100);
  }

  // ─── Navigation ─────────────────────────────
  setTab(tab: 'dashboard' | 'articles' | 'demandes'): void {
    this.activeTab = tab;
  }

  logout(): void { this.authService.logout(); }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // ─── Data ────────────────────────────────────
  async loadData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([this.loadArticles(), this.loadMyDemandes()]);
    } finally {
      this.loading = false;
    }
  }

  async loadArticles(): Promise<void> {
    try {
      const data = await this.http.get<Article[]>(`${this.apiUrl}/articles/search`).toPromise() || [];
      this.articles = data;
      this.filteredArticles = data;
    } catch { this.articles = []; this.filteredArticles = []; }
  }

  async loadMyDemandes(): Promise<void> {
    try {
      const data = await this.http.get<Demande[]>(`${this.apiUrl}/demandes/my-demandes`).toPromise() || [];
      this.myDemandes = data;
    } catch { this.myDemandes = []; }
  }

  filterArticles(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { this.filteredArticles = this.articles; return; }
    this.filteredArticles = this.articles.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.stock?.name?.toLowerCase().includes(q)
    );
  }

  // ─── Modal ───────────────────────────────────
  openDemandeModal(article: Article): void {
    this.selectedArticle = article;
    this.demandeQte = 1;
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedArticle = null;
    this.formError = '';
  }

  submitDemande(): void {
    if (!this.selectedArticle || !this.demandeQte) return;
    if (this.demandeQte < 1) { this.formError = 'Quantité invalide'; return; }

    const availableStock = this.selectedArticle.quantity || 0;
    if (this.demandeQte > availableStock) {
      this.formError = 'Quantité supérieure au stock disponible';
      return;
    }

    this.saving = true;
    this.formError = '';

    // 1. Beddel ArticleId (Majuscule) l articleId (Minuscule)
    // 2. T-akka3 mn l-path (wach demandes/create aw demandes/demandes/create)
    const params = {
      articleId: this.selectedArticle.id.toString(),
      qte: this.demandeQte.toString()
    };

    this.http.post<any>(`${this.apiUrl}/demandes/create`, null, { params }).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadMyDemandes();
        this.setTab('demandes');
      },
      error: (err) => {
        this.saving = false;
        // Ila baqa 403, checki l-console dial Spring Boot f IntelliJ
        this.formError = err.error?.message || `Erreur ${err.status}: Accès refusé`;
        console.error('Full error:', err);
      }
    });
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
      new THREE.Color(0x06b6d4),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x10b981),
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
      size: 0.025, vertexColors: true, transparent: true,
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
}
