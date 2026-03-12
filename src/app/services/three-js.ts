import { Injectable, ElementRef } from '@angular/core';
// @ts-ignore
import * as THREE from 'three';


@Injectable({
  providedIn: 'root',
})
export class ThreeJsService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particlesMesh!: THREE.Points;
  private cubes: THREE.Mesh[] = [];
  private animationId!: number;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private clock = new THREE.Clock();

  init(canvasContainer: ElementRef): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    // Particles
    this.createParticles();

    // Cubes
    this.createCubes();

    // Mouse event
    this.setupMouseEvents();

    // Start animation
    this.animate();
  }
  private createParticles(): void {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particlesMesh);
  }

  private createCubes(): void {
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    for(let i = 0; i < 20; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ff88 : 0x00ccff,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });

      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      );
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      this.cubes.push(cube);
      this.scene.add(cube);
    }
  }

  private setupMouseEvents(): void {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
      this.mouseX = (event.clientX - windowHalfX) / 100;
      this.mouseY = (event.clientY - windowHalfY) / 100;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const elapsedTime = this.clock.getElapsedTime();

    this.targetX = this.mouseX * 0.5;
    this.targetY = this.mouseY * 0.5;

    // Rotate particles
    this.particlesMesh.rotation.y += 0.001;
    this.particlesMesh.rotation.x += 0.0005;

    // Animate cubes
    this.cubes.forEach((cube, i) => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      cube.position.y += Math.sin(elapsedTime + i) * 0.002;
    });

    // Smooth camera movement
    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }

}
