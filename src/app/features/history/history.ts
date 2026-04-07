import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

interface StockHistory {
  id: number;
  articleId: number;
  articleName: string;
  stockName: string;
  userName: string;
  quantityChange: number | null;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'INCONNU';
  reason?: string | null;
  recordedAt: string;
  hasUser?: boolean;
  hasStock?: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  history: StockHistory[] = [];
  filteredHistory: StockHistory[] = [];
  loading = true;
  filter: 'ALL' | 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'NULL' = 'ALL';
  searchTerm = '';

  stats = {
    totalEntries: 0,
    totalExits: 0,
    totalAdjustments: 0,
    totalUnknown: 0
  };

  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initThreeJS(), 100);
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  private initThreeJS(): void {
    if (!this.threeCanvas) return;

    const canvas = this.threeCanvas.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x7c3aed),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xf59e0b)
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));

    this.scene.add(this.particles);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    this.animate();
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  private onResize(): void {
    if (!this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      this.particles.rotation.x += 0.0002;
    }

    if (this.camera) {
      this.camera.position.x += (this.mouseX * 0.3 - this.camera.position.x) * 0.03;
      this.camera.position.y += (-this.mouseY * 0.3 - this.camera.position.y) * 0.03;
      this.camera.lookAt(this.scene.position);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  loadHistory(): void {
    this.http.get<any[]>(`${this.apiUrl}/history/recent?all=true`).subscribe({
      next: (data) => {
        // ← Filter: Ghir li 3ndhom stock W user (7a9i9yin)
        this.history = data
          .filter(h => h.hasStock === true && h.hasUser === true)  // ← Hna
          .map(h => ({
            id: h.id,
            articleId: h.articleId,
            articleName: h.articleName || 'Article inconnu',
            stockName: h.stockName,
            userName: h.userName,
            quantityChange: h.quantityChange ?? 0,
            type: h.type,
            reason: h.reason || 'Aucune raison spécifiée',
            recordedAt: h.recordedAt,
            hasUser: true,
            hasStock: true
          }));

        this.filteredHistory = this.history;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement historique:', err);
        this.loading = false;
      }
    });
  }
  setFilter(type: 'ALL' | 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'NULL'): void {
    this.filter = type;
    this.filterHistory();
  }

  filterHistory(): void {
    let result = this.history;

    if (this.filter !== 'ALL') {
      if (this.filter === 'NULL') {
        result = result.filter(h => h.type === 'INCONNU');
      } else {
        result = result.filter(h => h.type === this.filter);
      }
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(h =>
        h.articleName?.toLowerCase().includes(term) ||
        h.stockName?.toLowerCase().includes(term) ||
        h.userName?.toLowerCase().includes(term)
      );
    }

    this.filteredHistory = result;
  }

  calculateStats(): void {
    this.stats.totalEntries = this.history
      .filter(h => h.type === 'ENTREE')
      .reduce((sum, h) => sum + Math.abs(h.quantityChange || 0), 0);

    this.stats.totalExits = this.history
      .filter(h => h.type === 'SORTIE')
      .reduce((sum, h) => sum + Math.abs(h.quantityChange || 0), 0);

    this.stats.totalAdjustments = this.history.filter(h => h.type === 'AJUSTEMENT').length;
    this.stats.totalUnknown = this.history.filter(h => h.type === 'INCONNU').length;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'ENTREE': return '📥';
      case 'SORTIE': return '📤';
      case 'AJUSTEMENT': return '⚖️';
      default: return '❓';
    }
  }

  getDisplayType(type: string): string {
    return type;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard-admin']);
  }
}
