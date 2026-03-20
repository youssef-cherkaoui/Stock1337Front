import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Article, ArticleRequest} from '../shared/models/article.model';


@Injectable({
  providedIn: 'root',
})
export class ArticlesService {

  private apiUrl = 'http://localhost:8087/api/v1/auth/articles';

  constructor(private http: HttpClient) {}

  searchArticles(stockId?: number, depaId?: number): Observable<Article[]> {
    let params = new HttpParams();
    if (stockId) params = params.set('stockId', stockId.toString());
    if (depaId) params = params.set('depaId', depaId.toString());

    return this.http.get<Article[]>(`${this.apiUrl}/search`, { params });
  }

  addArticle(request: ArticleRequest): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/add`, request);
  }

  getLowStockArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/Low-Stock`);
  }
}
