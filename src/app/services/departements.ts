import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Departement} from '../shared/models/departement.model';

@Injectable({
  providedIn: 'root',
})
export class DepartementsService {
  private apiUrl = 'http://localhost:8087/api/v1/auth/departements';

  constructor(private http: HttpClient) {}

  getAllDepartements(): Observable<Departement[]> {
    return this.http.get<Departement[]>(`${this.apiUrl}/all`);
  }

  addDepartement(departement: Departement): Observable<Departement> {
    return this.http.post<Departement>(`${this.apiUrl}/addDepartment`, departement);
  }

  updateDepartement(id: number, departement: Departement): Observable<Departement> {
    return this.http.put<Departement>(`${this.apiUrl}/${id}`, departement);
  }

  deleteDepartement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
