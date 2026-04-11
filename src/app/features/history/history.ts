import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

interface StockHistory {
  id: number;
  articleId: number;
  articleName: string;
  stockName: string;
  departementName: string;
  userName: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  quantityChange: number;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
  reason: string;
  recordedAt: string;
  hasUser: boolean;
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
  filter: 'ALL' | 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' = 'ALL';

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

  loadHistory(): void {
    const token = localStorage.getItem('token');
    const url = `${this.apiUrl}/history/recent`;

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token || ''}`);

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Données brutes:', data);

        this.history = data.map(h => {
          const article = h.article || {};
          const stock = article.stock || {};
          const departement = stock.departement || {};

          const user = h.user || h.createdBy || h.utilisateur || h.userEntity || {};

          let userName = '';

          if (user && user.id) {
            if (user.firstName && user.lastName) {
              userName = `${user.firstName} ${user.lastName}`;
            } else if (user.prenom && user.nom) {
              userName = `${user.prenom} ${user.nom}`;
            } else if (user.name && user.name.trim()) {
              userName = user.name;
            } else if (user.username && user.username.trim()) {
              userName = user.username;
            } else if (user.lastName || user.nom) {
              userName = user.lastName || user.nom;
            } else if (user.firstName || user.prenom) {
              userName = user.firstName || user.prenom;
            } else if (user.email) {
              const atIndex = user.email.indexOf('@');
              userName = atIndex > 0 ? user.email.substring(0, atIndex) : user.email;
            } else {
              userName = 'Inconnu';
            }
          } else {
            userName = 'Inconnu';
          }

          let type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' = 'AJUSTEMENT';
          const qty = h.quantityChange ?? h.quantity ?? 0;

          if (h.type) {
            type = h.type;
          } else if (qty > 0) {
            type = 'ENTREE';
          } else if (qty < 0) {
            type = 'SORTIE';
          }

          return {
            id: h.id,
            articleId: article.id,
            articleName: article.name || 'Article inconnu',
            stockName: stock.name || 'Stock non spécifié',
            departementName: departement.name || 'Département non spécifié',
            userName: userName,
            quantityChange: qty,
            type: type,
            reason: h.reason || (qty > 0 ? 'Entrée stock' : qty < 0 ? 'Sortie stock' : 'Ajustement'),
            recordedAt: h.recordedAt,
            hasUser: !!user.id,
            hasStock: !!stock.id,
            hasDepartement: !!departement.id
          };
        });

        console.log('🎯 Données mappées:', this.history);
        this.filteredHistory = [...this.history];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const totalMovements = this.history.length;
    const totalEntrees = this.history.filter(h => h.type === 'ENTREE').length;
    const totalSorties = this.history.filter(h => h.type === 'SORTIE').length;
    const totalAjustements = this.history.filter(h => h.type === 'AJUSTEMENT').length;

    const totalQuantityEntrees = this.history
      .filter(h => h.type === 'ENTREE')
      .reduce((sum, h) => sum + h.quantityChange, 0);

    const totalQuantitySorties = this.history
      .filter(h => h.type === 'SORTIE')
      .reduce((sum, h) => sum + Math.abs(h.quantityChange), 0);

    console.log('📊 Statistiques:', {
      totalMovements,
      entrees: totalEntrees,
      sorties: totalSorties,
      ajustements: totalAjustements,
      quantiteEntrees: totalQuantityEntrees,
      quantiteSorties: totalQuantitySorties
    });
  }

  setFilter(type: 'ALL' | 'ENTREE' | 'SORTIE' | 'AJUSTEMENT'): void {
    this.filter = type;
    if (type === 'ALL') {
      this.filteredHistory = [...this.history];
    } else {
      this.filteredHistory = this.history.filter(h => h.type === type);
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'ENTREE': return '📥';
      case 'SORTIE': return '📤';
      case 'AJUSTEMENT': return '⚖️';
      default: return '📝';
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard-admin']);
  }
}
