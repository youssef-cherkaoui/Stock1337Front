import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as THREE from 'three';
import { StockService } from '../../services/stock';
import { Departement } from '../../shared/models/departement.model';
import { DepartementsService } from '../../services/departements';
import { AuthService } from '../../services/AuthService';
import { Stock, StockRequest } from '../../shared/models/stock.model';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stocks.html',
  styleUrls: ['./stocks.css']
})
export class StocksComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  stocks: Stock[] = [];
  departements: Departement[] = [];
  isAdmin = false;
  showAddForm = false;
  editingStock: Stock | null = null;
  stockForm: FormGroup;

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
    private stockService: StockService,
    private deptService: DepartementsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.stockForm = this.fb.group({
      name: ['', Validators.required],
      localisation: ['', Validators.required],
      departementId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadStocks();
    this.deptService.getAllDepartements().subscribe(data => this.departements = data);
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

  // Three.js initialization
  private initThreeJS(): void {
    if (!this.threeCanvas?.nativeElement) return;

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

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe(data => {
      this.stocks = data;
    });
  }

  createStock(): void {
    if (this.stockForm.invalid) return;

    const request: StockRequest = this.stockForm.value;

    if (this.editingStock) {
      this.stockService.updateStock(this.editingStock.id, request).subscribe({
        next: () => {
          this.loadStocks();
          this.cancelEdit();
        },
        error: (err) => alert('Erreur update: ' + err.message)
      });
    } else {
      this.stockService.createStock(request).subscribe({
        next: () => {
          this.loadStocks();
          this.showAddForm = false;
          this.stockForm.reset();
        },
        error: (err) => alert('Erreur création: ' + err.message)
      });
    }
  }

  editStock(stock: Stock): void {
    this.editingStock = stock;
    this.showAddForm = true;
    this.stockForm.patchValue({
      name: stock.name,
      localisation: stock.localisation,
      departementId: stock.departement?.id || ''
    });
  }

  cancelEdit(): void {
    this.editingStock = null;
    this.showAddForm = false;
    this.stockForm.reset();
  }

  deleteStock(id: number): void {
    if (confirm('Supprimer ce stock?')) {
      this.stockService.deleteStock(id).subscribe({
        next: () => this.loadStocks(),
        error: (err) => alert('Erreur suppression: ' + err.message)
      });
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard-admin']);
  }
}
