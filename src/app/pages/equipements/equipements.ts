import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-24 px-6 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">Équipements</h1>

        <!-- Search & Filter -->
        <div class="glass-panel p-4 rounded-2xl mb-6 flex gap-4">
          <input type="text" placeholder="Rechercher un équipement..."
                 class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white">
          <select class="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white">
            <option>Tous les types</option>
            <option>PC</option>
            <option>Écran</option>
            <option>Périphérique</option>
          </select>
        </div>

        <!-- Equipment Table -->
        <div class="glass-panel rounded-2xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="p-4 text-left">ID</th>
                <th class="p-4 text-left">Type</th>
                <th class="p-4 text-left">Modèle</th>
                <th class="p-4 text-left">Département</th>
                <th class="p-4 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let eq of equipements" class="border-t border-white/10">
                <td class="p-4 font-mono">{{ eq.id }}</td>
                <td class="p-4">{{ eq.type }}</td>
                <td class="p-4">{{ eq.modele }}</td>
                <td class="p-4">{{ eq.departement }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded text-xs"
                        [class]="eq.statut === 'Disponible' ? 'bg-green-500/20 text-green-400' :
                                 eq.statut === 'En utilisation' ? 'bg-yellow-500/20 text-yellow-400' :
                                 'bg-red-500/20 text-red-400'">
                    {{ eq.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
export class EquipementsComponent {
  equipements = [
    { id: 'PC-001', type: 'PC', modele: 'Dell OptiPlex 7090', departement: 'Pool', statut: 'Disponible' },
    { id: 'PC-002', type: 'PC', modele: 'Dell OptiPlex 7090', departement: 'Pool', statut: 'En utilisation' },
    { id: 'ECR-015', type: 'Écran', modele: 'Dell P2419H 24"', departement: 'Cluster A', statut: 'Disponible' },
    { id: 'SOUR-042', type: 'Souris', modele: 'Logitech M720', departement: 'Cluster B', statut: 'En réparation' },
    { id: 'CLAV-023', type: 'Clavier', modele: 'Keychron K2', departement: 'FabLab', statut: 'Disponible' },
  ];
}
