import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {AuthService} from '../../services/AuthService';
import {DemandeService} from '../../services/demande';
import {ArticlesService} from '../../services/articles';
import {Article} from '../../shared/models/article.model';
import {Demande} from '../../shared/models/demande.model';

@Component({
  selector: 'app-dashbord',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashbord.html',
  styleUrl: './dashbord.css',
})
export class DashbordComponent implements OnInit {

  articles: Article[] = [];
  lowStockArticles: Article[] = [];
  pendingDemandes: Demande[] = [];
  myDemandes: Demande[] = [];

  constructor(
    public authService: AuthService,
    private articleService: ArticlesService,
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.articleService.searchArticles().subscribe(data => {
      this.articles = data;
    });

    this.articleService.getLowStockArticles().subscribe(data => {
      this.lowStockArticles = data;
    });

    if (this.authService.isAdmin()) {
      this.demandeService.getPendingDemandes().subscribe(data => {
        this.pendingDemandes = data;
      });
    }

    this.demandeService.getMyDemandes().subscribe(data => {
      this.myDemandes = data;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    const name = this.authService.getCurrentUser()?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }


}
