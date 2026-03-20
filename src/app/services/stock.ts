// services/stock.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, StockRequest } from '../shared/models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8087/api/v1/auth/stocks';

  constructor(private http: HttpClient) {}

  getAllStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/all`);
  }

  getStockByDepartement(deptId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/departement/${deptId}`);
  }

  createStock(request: StockRequest): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}/create`, request);
  }

  updateStock(id: number, request: StockRequest): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/update/${id}`, request);
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
