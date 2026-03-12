import { Injectable } from '@angular/core';

import {AuthenticationRequest, AuthenticationResponse} from '../models/auth.model';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8082/api/v1/auth';

  constructor(
    private http: HttpClient,
  ) {}

  login(request : AuthenticationRequest) : Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.API_URL}/authenticate`, request);
  }

  register(request : any , endpoint : string): Observable<any> {
    return this.http.post(`${this.API_URL}${endpoint}`, request);
  }

  saveSession(res: AuthenticationResponse)  {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
}
