import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './AuthService';



export interface UserStatus {
  userId: number;
  name: string;
  email: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string;
  connectedAt?: string;
  disconnectedAt?: string;
  avatar?: string;
  role?: string;
}

export interface StatusStats {
  online: number;
  offline: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserStatusService implements OnDestroy {

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any;

  private usersSubject = new BehaviorSubject<UserStatus[]>([]);
  private statsSubject = new BehaviorSubject<StatusStats>({ online: 0, offline: 0, total: 0 });
  private connectionStatus = new BehaviorSubject<boolean>(false);

  public users$ = this.usersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public isConnected$ = this.connectionStatus.asObservable();

  private apiUrl = 'https://stock1337.onrender.com/api/v1/auth';
  private wsUrl = 'wss://stock1337.onrender.com/ws/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    try {
      const token = localStorage.getItem('token') || '';
      this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connecté');
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
        this.requestInitialData();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket déconnecté');
        this.connectionStatus.next(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket erreur:', error);
        this.connectionStatus.next(false);
      };

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);

      this.reconnectTimeout = setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    }
  }

  private requestInitialData(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'GET_USERS_STATUS' }));
    }
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'USERS_LIST':
        this.updateUsers(data.users);
        break;
      case 'USER_CONNECTED':
        this.handleUserConnected(data.user);
        break;
      case 'USER_DISCONNECTED':
        this.handleUserDisconnected(data.user);
        break;
      case 'STATUS_UPDATE':
        this.updateUserStatus(data.userId, data.status);
        break;
      case 'PING':
        this.ws?.send(JSON.stringify({ type: 'PONG' }));
        break;
    }
  }

  private updateUsers(users: UserStatus[]): void {
    this.usersSubject.next(users);
    this.calculateStats(users);
  }

  private handleUserConnected(user: UserStatus): void {
    const current = this.usersSubject.value;
    const existing = current.find(u => u.userId === user.userId);

    let updated: UserStatus[];
    if (existing) {
      updated = current.map(u => u.userId === user.userId ? { ...user, status: 'ONLINE' } : u);
    } else {
      updated = [...current, { ...user, status: 'ONLINE' }];
    }

    this.usersSubject.next(updated);
    this.calculateStats(updated);
  }

  private handleUserDisconnected(user: UserStatus): void {
    const current = this.usersSubject.value;
    const updated = current.map(u =>
      u.userId === user.userId
        ? { ...u, status: 'OFFLINE' as const, disconnectedAt: new Date().toISOString() }
        : u
    );

    this.usersSubject.next(updated);
    this.calculateStats(updated);
  }

  private updateUserStatus(userId: number, status: 'ONLINE' | 'OFFLINE'): void {
    const current = this.usersSubject.value;
    const updated = current.map(u =>
      u.userId === userId ? { ...u, status } : u
    );

    this.usersSubject.next(updated);
    this.calculateStats(updated);
  }

  private calculateStats(users: UserStatus[]): void {
    const online = users.filter(u => u.status === 'ONLINE').length;
    const offline = users.filter(u => u.status === 'OFFLINE').length;

    this.statsSubject.next({
      online,
      offline,
      total: users.length
    });
  }

  public loadUsersStatus(): void {
    this.http.get<UserStatus[]>(`${this.apiUrl}/users/status`).subscribe({
      next: (users) => {
        this.updateUsers(users);
      },
      error: (err) => {
        console.error('Erreur chargement status:', err);
      }
    });
  }

  public getOnlineUsers(): UserStatus[] {
    return this.usersSubject.value.filter(u => u.status === 'ONLINE');
  }

  public getOfflineUsers(): UserStatus[] {
    return this.usersSubject.value.filter(u => u.status === 'OFFLINE');
  }

  ngOnDestroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }


}
