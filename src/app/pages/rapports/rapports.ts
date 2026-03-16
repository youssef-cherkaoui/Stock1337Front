import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-24 px-6 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Rapports</h1>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-xl font-bold mb-4">Équipements par Département</h3>
            <div class="space-y-3">
              <div *ngFor="let item of stats" class="flex justify-between items-center">
                <span>{{ item.dept }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-400 to-cyan-500"
                         [style.width.%]="item.pourcentage"></div>
                  </div>
                  <span class="text-sm text-gray-400">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-xl font-bold mb-4">Statuts des Équipements</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-green-500/20 rounded-lg">
                <span class="text-green-400">Disponibles</span>
                <span class="text-2xl font-bold text-green-400">68%</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg">
                <span class="text-yellow-400">En Utilisation</span>
                <span class="text-2xl font-bold text-yellow-400">23%</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-red-500/20 rounded-lg">
                <span class="text-red-400">En Réparation</span>
                <span class="text-2xl font-bold text-red-400">9%</span>
              </div>
            </div>
          </div>
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
  `]
})
export class RapportsComponent {
  stats = [
    { dept: 'Pool', count: 45, pourcentage: 25 },
    { dept: 'Cluster A', count: 32, pourcentage: 18 },
    { dept: 'Cluster B', count: 28, pourcentage: 15 },
    { dept: 'FabLab', count: 15, pourcentage: 8 },
    { dept: 'Administration', count: 12, pourcentage: 7 },
  ];
}
