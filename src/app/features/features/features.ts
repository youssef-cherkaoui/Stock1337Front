import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [],
  template: `
    <section class="relative z-10 py-20 px-6">
      <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all">
          <h3 class="text-lg font-bold mb-2 text-green-400">Real-Time Execution</h3>
          <p class="text-sm text-gray-400">Execute trades in milliseconds with our high-frequency trading infrastructure.</p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all">
          <h3 class="text-lg font-bold mb-2 text-cyan-400">Advanced Analytics</h3>
          <p class="text-sm text-gray-400">AI-powered market analysis and predictive modeling for better decisions.</p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
          <h3 class="text-lg font-bold mb-2 text-purple-400">Bank-Grade Security</h3>
          <p class="text-sm text-gray-400">256-bit encryption and multi-factor authentication protect your assets.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `]
})
export class FeaturesComponent {}
