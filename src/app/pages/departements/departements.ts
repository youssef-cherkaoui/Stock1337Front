import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-24 px-6 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Départements</h1>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let dept of departements"
               class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all cursor-pointer">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl flex items-center justify-center text-black font-bold text-xl">
                {{ dept.initiale }}
              </div>
              <span class="text-green-400 text-sm font-mono">{{ dept.pcCount }} PC</span>
            </div>
            <h3 class="text-xl font-bold mb-2">{{ dept.nom }}</h3>
            <p class="text-sm text-gray-400 mb-4">{{ dept.description }}</p>
            <div class="flex gap-2">
              <span class="px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">{{ dept.dispo }} Dispo</span>
              <span class="px-2 py-1 bg-yellow-500/20 rounded text-xs text-yellow-400">{{ dept.occupe }} Occupés</span>
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
export class DepartementsComponent {
  departements = [
    { initiale: 'P', nom: 'Pool', description: 'Espace de travail commun', pcCount: 45, dispo: 38, occupe: 7 },
    { initiale: 'A', nom: 'Cluster A', description: 'Salle de projet', pcCount: 32, dispo: 28, occupe: 4 },
    { initiale: 'B', nom: 'Cluster B', description: 'Espace détente', pcCount: 28, dispo: 25, occupe: 3 },
    { initiale: 'AD', nom: 'Administration', description: 'Bureaux staff', pcCount: 12, dispo: 8, occupe: 4 },
    { initiale: 'R', nom: 'Salle de Réunion', description: 'Présentations', pcCount: 8, dispo: 6, occupe: 2 },
    { initiale: 'F', nom: 'FabLab', description: 'Prototypage', pcCount: 15, dispo: 12, occupe: 3 },
  ];
}
