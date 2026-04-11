import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StatusStats, UserStatus, UserStatusService} from '../services/user-status';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-admin-user-status-management',
  imports: [CommonModule],
  templateUrl: './admin-user-status-management.html',
  styleUrl: './admin-user-status-management.css',
})
export class AdminUserStatusManagement implements OnInit, OnDestroy{

  onlineUsers: UserStatus[] = [];
  stats: StatusStats = { online: 0, offline: 0, total: 0 };

  isConnected = false;
  loading = true;
  currentTime = new Date();
  recentActivity: Array<{type: string, userName: string, time: string}> = [];

  private subscriptions: Subscription[] = [];
  private timeInterval: any;

  constructor(private userStatusService: UserStatusService) {}
  ngOnInit(): void {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);


    this.subscriptions.push(
      this.userStatusService.users$.subscribe(users => {
        const previousOnline = this.onlineUsers.map(u => u.userId);
        this.onlineUsers = users.filter(u => u.status === 'ONLINE');

        this.onlineUsers.forEach(user => {
          if (!previousOnline.includes(user.userId) && user.connectedAt) {
            const connectTime = new Date(user.connectedAt);
            const now = new Date();
            if (now.getTime() - connectTime.getTime() < 60000) {
              this.addActivity('connect', user.name);
            }
          }
        });

        this.loading = false;
      })
    );


    this.subscriptions.push(
      this.userStatusService.stats$.subscribe(stats => {
        this.stats = stats;
      })
    );

    this.subscriptions.push(
      this.userStatusService.isConnected$.subscribe(connected => {
        this.isConnected = connected;
      })
    );


    setTimeout(() => {
      if (this.loading) {
        this.userStatusService.loadUsersStatus();
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private addActivity(type: string, userName: string): void {
    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.recentActivity.unshift({ type, userName, time });

    if (this.recentActivity.length > 5) {
      this.recentActivity = this.recentActivity.slice(0, 5);
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #7c3aed, #a855f7)',
      'linear-gradient(135deg, #059669, #10b981)',
      'linear-gradient(135deg, #dc2626, #f87171)',
      'linear-gradient(135deg, #2563eb, #3b82f6)',
      'linear-gradient(135deg, #ea580c, #fb923c)',
      'linear-gradient(135deg, #0891b2, #22d3ee)',
      'linear-gradient(135deg, #db2777, #f472b6)',
      'linear-gradient(135deg, #65a30d, #a3e635)'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
