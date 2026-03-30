// services/demande.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CauseRefus, Demande} from '../shared/models/demande.model';


@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth/demandes';

  constructor(private http: HttpClient) {}

  createDemande(articleId: number, qte: number): Observable<Demande> {
    const params = new HttpParams()
      .set('ArticleId', articleId.toString())
      .set('qte', qte.toString());
    return this.http.post<Demande>(`${this.apiUrl}/create`, null, { params });
  }

  getMyDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/my-demandes`);
  }

  getPendingDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/pending`);
  }

  approveDemande(id: number): Observable<Demande> {
    return this.http.put<Demande>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectDemande(id: number, cause: CauseRefus): Observable<Demande> {
    const params = new HttpParams().set('cause', cause);
    return this.http.put<Demande>(`${this.apiUrl}/${id}/reject`, null, { params });
  }
}
