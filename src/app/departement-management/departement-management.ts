import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';

interface Departement {
  id: number;
  name: string;
}

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departement-management.html',
  styleUrls: ['./departement-management.css'],
})
export class DepartementsManagement implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  departements: Departement[] = [];
  filteredDepts: Departement[] = [];
  searchQuery = '';
  loading = true;

  // Modal
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  saving = false;
  formError = '';
  deptToDelete: Departement | null = null;
  editingId: number | null = null;
  form = { name: '' };

  private apiUrl = 'https://stock1337.onrender.com/v1/auth/departements';

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { this.loadDepts(); }
  ngAfterViewInit(): void { this.initThreeJS(); }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
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
      new THREE.Color(0x3b82f6),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x06b6d4),
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

  // ─── Data ────────────────────────────────────
  loadDepts(): void {
    this.loading = true;
    this.http.get<Departement[]>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.departements = data;
        this.filteredDepts = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterDepts(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { this.filteredDepts = this.departements; return; }
    this.filteredDepts = this.departements.filter(d => d.name.toLowerCase().includes(q));
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredDepts = this.departements;
  }

  // ─── Modal ───────────────────────────────────
  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = { name: '' };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(dept: Departement): void {
    this.isEditing = true;
    this.editingId = dept.id;
    this.form = { name: dept.name };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formError = '';
  }

  saveDept(): void {
    if (!this.form.name.trim()) { this.formError = 'Nom obligatoire'; return; }
    this.saving = true;
    this.formError = '';

    if (this.isEditing && this.editingId) {
      this.http.put<Departement>(`${this.apiUrl}/${this.editingId}`, { name: this.form.name }).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadDepts(); },
        error: (err) => { this.saving = false; this.formError = err.error?.message || 'Erreur'; }
      });
    } else {
      this.http.post<Departement>(`${this.apiUrl}/addDepartment`, { name: this.form.name }).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadDepts(); },
        error: (err) => { this.saving = false; this.formError = err.error?.message || 'Erreur'; }
      });
    }
  }

  confirmDelete(dept: Departement): void {
    this.deptToDelete = dept;
    this.showDeleteModal = true;
  }

  deleteDept(): void {
    if (!this.deptToDelete) return;
    this.http.delete(`${this.apiUrl}/${this.deptToDelete.id}`).subscribe({
      next: () => { this.showDeleteModal = false; this.deptToDelete = null; this.loadDepts(); },
      error: () => { this.showDeleteModal = false; }
    });
  }

  navigateTo(path: string): void { this.router.navigate([`/admin/${path}`]); }
}
