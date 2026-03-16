import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-8">
      <div class="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span class="text-xs font-medium text-gray-300">Live Market Data</span>
      </div>

      <h1 class="text-5xl md:text-7xl font-bold leading-tight">
        Trade Smarter with <span class="gradient-text">AI-Powered</span> Insights
      </h1>

      <p class="text-lg text-gray-400 max-w-lg leading-relaxed">
        Experience the future of trading with real-time analytics, predictive modeling, and institutional-grade tools designed for modern investors.
      </p>

      <div class="flex flex-wrap gap-4">
        <button class="glow-button bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold px-8 py-4 rounded-full text-lg hover:shadow-2xl transition-all transform hover:scale-105">
          Start Trading Now
        </button>
        <button class="glass-panel px-8 py-4 rounded-full text-lg font-medium hover:bg-white/5 transition-all">
          Watch Demo
        </button>
      </div>

      <div class="flex items-center gap-6 pt-4">
        <div class="flex -space-x-3">
          <img src="https://i.pravatar.cc/150?img=1" class="w-10 h-10 rounded-full border-2 border-black">
          <img src="https://i.pravatar.cc/150?img=2" class="w-10 h-10 rounded-full border-2 border-black">
          <img src="https://i.pravatar.cc/150?img=3" class="w-10 h-10 rounded-full border-2 border-black">
          <img src="https://i.pravatar.cc/150?img=4" class="w-10 h-10 rounded-full border-2 border-black">
        </div>
        <div>
          <div class="text-2xl font-bold gradient-text">50K+</div>
          <div class="text-sm text-gray-400">Active Traders</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .gradient-text {
      background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .glow-button {
      position: relative;
      overflow: hidden;
    }
  `]
})
export class HeroComponent {}
