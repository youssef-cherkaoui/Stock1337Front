import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-24 px-6 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Tableau de Bord</h1>

        <!-- Stats -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <div class="glass-panel p-6 rounded-2xl">
            <div class="text-3xl font-bold text-green-400">1,834</div>
            <div class="text-gray-400">Total Équipements</div>
          </div>
          <div class="glass-panel p-6 rounded-2xl">
            <div class="text-3xl font-bold text-cyan-400">1,245</div>
            <div class="text-gray-400">Disponibles</div>
          </div>
          <div class="glass-panel p-6 rounded-2xl">
            <div class="text-3xl font-bold text-yellow-400">423</div>
            <div class="text-gray-400">En Utilisation</div>
          </div>
          <div class="glass-panel p-6 rounded-2xl">
            <div class="text-3xl font-bold text-red-400">166</div>
            <div class="text-gray-400">En Réparation</div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass-panel p-6 rounded-2xl">
          <h2 class="text-2xl font-bold mb-4">Activité Récente</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span>PC-042 déplacé vers Pool</span>
              <span class="text-gray-400">Il y a 5 min</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span>Souris défectueuse signalée - Cluster A</span>
              <span class="text-gray-400">Il y a 12 min</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span>Nouveau câble HDMI ajouté au stock</span>
              <span class="text-gray-400">Il y a 1 heure</span>
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
export class DashboardComponent {}
