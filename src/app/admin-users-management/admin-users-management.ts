import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users-management.html',
  styleUrls: ['./admin-users-management.css'],
})
export class AdminUsersManagement implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  loading = true;

  // Modal state
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  saving = false;
  formError = '';
  userToDelete: User | null = null;
  editingId: number | null = null;

  form: UserForm = { name: '', email: '', password: '', phone: '' };

  private apiUrl = 'http://localhost:8087/api/v1/auth';

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private particles!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
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

  // ─── Three.js ─────────────────────────────────
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

    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x7c3aed),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x06b6d4),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.028, vertexColors: true, transparent: true,
      opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false,
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
    const w = window.innerWidth, h = window.innerHeight;
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

  // ─── Data ─────────────────────────────────────
  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>(`${this.apiUrl}/Admin/all`).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredUsers = this.users;
  }

  // ─── Modal ────────────────────────────────────
  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = { name: '', email: '', password: '', phone: '' };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.isEditing = true;
    this.editingId = user.id;
    this.form = { name: user.name || '', email: user.email, password: '', phone: user.phone || '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formError = '';
  }

  saveUser(): void {
    if (!this.form.email) { this.formError = 'Email obligatoire'; return; }
    if (!this.isEditing && !this.form.password) { this.formError = 'Mot de passe obligatoire'; return; }

    this.saving = true;
    this.formError = '';

    if (this.isEditing && this.editingId) {
      const payload: any = { name: this.form.name, email: this.form.email, phone: this.form.phone };
      if (this.form.password) payload.password = this.form.password;

      this.http.put<User>(`${this.apiUrl}/User/${this.editingId}`, payload).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: (err) => { this.saving = false; this.formError = err.error?.message || 'Erreur de mise à jour'; }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/register/user`, {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
      }).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: (err) => { this.saving = false; this.formError = err.error?.message || 'Erreur de création'; }
      });
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;
    this.http.delete(`${this.apiUrl}/Admin/${this.userToDelete.id}`).subscribe({
      next: () => { this.showDeleteModal = false; this.userToDelete = null; this.loadUsers(); },
      error: () => { this.showDeleteModal = false; }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
