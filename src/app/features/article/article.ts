import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Departement } from '../../shared/models/departement.model';
import { StockService } from '../../services/stock';
import { ArticlesService } from '../../services/articles';
import { DepartementsService } from '../../services/departements';
import { AuthService } from '../../services/AuthService';
import { Article, ArticleRequest } from '../../shared/models/article.model';
import { Stock } from '../../shared/models/stock.model';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './article.html',
  styleUrls: ['./article.css'],
})
export class ArticleComponent implements OnInit {
  articles: Article[] = [];
  stocks: Stock[] = [];
  departements: Departement[] = [];
  isAdmin = false;
  showAddForm = false;
  articleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticlesService,
    private stockService: StockService,
    private deptService: DepartementsService,
    private authService: AuthService
  ) {
    this.articleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      minThreshold: [5],
      stockId: ['', Validators.required],
      departementId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadArticles();
    this.stockService.getAllStocks().subscribe(data => this.stocks = data);
    this.deptService.getAllDepartements().subscribe(data => this.departements = data);
  }

  loadArticles(): void {
    this.articleService.searchArticles().subscribe(data => {
      this.articles = data;
    });
  }

  onStockFilter(event: any): void {
    const stockId = event.target.value;
    this.filterArticles(stockId ? parseInt(stockId) : undefined, undefined);
  }

  onDeptFilter(event: any): void {
    const deptId = event.target.value;
    this.filterArticles(undefined, deptId ? parseInt(deptId) : undefined);
  }

  filterArticles(stockId?: number, deptId?: number): void {
    this.articleService.searchArticles(stockId, deptId).subscribe(data => {
      this.articles = data;
    });
  }

  addArticle(): void {
    if (this.articleForm.invalid) return;

    const request: ArticleRequest = this.articleForm.value;
    this.articleService.addArticle(request).subscribe({
      next: () => {
        this.loadArticles();
        this.showAddForm = false;
        this.articleForm.reset({ minThreshold: 5 });
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  demandeArticle(article: Article): void {
    alert(`Demande pour: ${article.name}`);
  }
}
