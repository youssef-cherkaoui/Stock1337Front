import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../services/demande';

import { AuthService } from '../../services/AuthService';
import {CauseRefus, Demande} from '../../shared/models/demande.model';
import { Article } from '../../shared/models/article.model';
import {ArticlesService} from '../../services/articles';

@Component({
  selector: 'app-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './demande.html',
  styleUrls: ['./demande.css'],
})
export class DemandeComponent implements OnInit {
  demandeForm: FormGroup;
  articles: Article[] = [];
  myDemandes: Demande[] = [];
  pendingDemandes: Demande[] = [];
  isAdmin = false;
  causeRefusValues = Object.values(CauseRefus);

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private articleService: ArticlesService,
    private authService: AuthService
  ) {
    this.demandeForm = this.fb.group({
      articleId: ['', Validators.required],
      qte: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadArticles();
    this.loadMyDemandes();
    if (this.isAdmin) {
      this.loadPendingDemandes();
    }
  }

  loadArticles(): void {
    this.articleService.searchArticles().subscribe(data => {
      this.articles = data;
    });
  }

  loadMyDemandes(): void {
    this.demandeService.getMyDemandes().subscribe(data => {
      this.myDemandes = data;
    });
  }

  loadPendingDemandes(): void {
    this.demandeService.getPendingDemandes().subscribe(data => {
      this.pendingDemandes = data;
    });
  }

  createDemande(): void {
    if (this.demandeForm.invalid) return;

    const { articleId, qte } = this.demandeForm.value;
    this.demandeService.createDemande(articleId, qte).subscribe({
      next: () => {
        this.demandeForm.reset({ qte: 1 });
        this.loadMyDemandes();
        alert('Demande créée avec succès!');
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  approve(id: number): void {
    this.demandeService.approveDemande(id).subscribe({
      next: () => {
        this.loadPendingDemandes();
        alert('Demande approuvée!');
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  reject(id: number, event: Event): void {
    const cause = (event.target as HTMLSelectElement).value as CauseRefus;
    if (!cause) return;

    this.demandeService.rejectDemande(id, cause).subscribe({
      next: () => {
        this.loadPendingDemandes();
        alert('Demande refusée');
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }
}
