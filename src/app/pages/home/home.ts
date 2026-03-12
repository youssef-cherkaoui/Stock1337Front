import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ThreeJsService} from '../../services/three-js';
// @ts-ignore
import gsap from 'gsap';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    NgIf
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';

  constructor(private threeJsService: ThreeJsService) {}

  ngOnInit(): void {
    this.threeJsService.init(this.canvasContainer);
    this.initAnimations();
  }

  ngOnDestroy(): void {
    this.threeJsService.destroy();
  }

  private initAnimations(): void {
    gsap.from("nav", {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });

    gsap.from(".hero-title", {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: "power4.out"
    });

    gsap.from(".dashboard-card", {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 0.8,
      ease: "power4.out"
    });
  }

  openAuth(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.showAuthModal = true;
  }

  closeAuth(): void {
    this.showAuthModal = false;
  }
}
