import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Article, ArticleRequest} from '../shared/models/article.model';


@Injectable({
  providedIn: 'root',
})
export class ArticlesService {

  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth/articles';

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

  updateArticle(id: number, request: ArticleRequest): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/update-article/${id}`, request);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-article/${id}`);
  }
}
