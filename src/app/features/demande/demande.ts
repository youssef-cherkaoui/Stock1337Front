import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../services/demande';
import { AuthService } from '../../services/AuthService';
import { CauseRefus, Demande } from '../../shared/models/demande.model';
import { Article } from '../../shared/models/article.model';
import { ArticlesService } from '../../services/articles';
import * as THREE from 'three';

@Component({
  selector: 'app-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './demande.html',
  styleUrls: ['./demande.css'],
})
export class DemandeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  demandeForm: FormGroup;
  articles: Article[] = [];
  myDemandes: Demande[] = [];
  pendingDemandes: Demande[] = [];
  isAdmin = false;
  causeRefusValues = Object.values(CauseRefus);

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
    private demandeService: DemandeService,
    private articleService: ArticlesService,
    private authService: AuthService
  ) {
    this.demandeForm = this.fb.group({
      articleId: ['', Validators.required],
      qte: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadArticles();
    this.loadMyDemandes();
    if (this.isAdmin) {
      this.loadPendingDemandes();
    }
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

  // ─── Three.js ───────────────────────────────────
  private initThreeJS(): void {
    const canvas = this.threeCanvas.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color(0x00ff88),
      new THREE.Color(0x00ccff),
      new THREE.Color(0x8b5cf6),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    // Events
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.particles.rotation.y += 0.0008;
    this.particles.rotation.x += 0.0003;

    this.camera.position.x += (this.mouseX * 0.4 - this.camera.position.x) * 0.04;
    this.camera.position.y += (-this.mouseY * 0.4 - this.camera.position.y) * 0.04;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  // ─── Data ────────────────────────────────────────
  loadArticles(): void {
    this.articleService.searchArticles().subscribe(data => this.articles = data);
  }

  loadMyDemandes(): void {
    this.demandeService.getMyDemandes().subscribe(data => this.myDemandes = data);
  }

  loadPendingDemandes(): void {
    this.demandeService.getPendingDemandes().subscribe(data => this.pendingDemandes = data);
  }

  createDemande(): void {
    if (this.demandeForm.invalid) return;

    const { articleId, qte } = this.demandeForm.value;


    const selectedArticle = this.articles.find(a => a.id === parseInt(articleId));
    const stockId = selectedArticle?.stock?.id;

    this.demandeService.createDemande(articleId, qte, stockId).subscribe({
      next: () => {
        this.demandeForm.reset({ qte: 1 });
        this.loadMyDemandes();
      },
      error: (err) => console.error(err)
    });
  }

  approve(id: number): void {
    this.demandeService.approveDemande(id).subscribe({
      next: () => this.loadPendingDemandes(),
      error: (err) => console.error(err)
    });
  }

  reject(id: number, event: Event): void {
    const cause = (event.target as HTMLSelectElement).value as CauseRefus;
    if (!cause) return;
    this.demandeService.rejectDemande(id, cause).subscribe({
      next: () => this.loadPendingDemandes(),
      error: (err) => console.error(err)
    });
  }
}
