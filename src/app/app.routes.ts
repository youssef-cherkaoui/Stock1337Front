
import { Routes } from '@angular/router';
import {adminGuard, authGuard, publicGuard, userGuard} from './features/auth/gards/auth-guard';


export const routes: Routes = [
  // ========== PUBLIC ROUTES ==========
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },


  // ========== HOME ==========
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },

  // ========== ADMIN ROUTES ==========
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      // },
      // {
      //   path: 'users',
      //   loadComponent: () => import('./features/admin/users/admin-users').then(m => m.AdminUsersComponent)
      // },
      {
        path: 'stocks',
        loadComponent: () => import('./features/stocks/stocks').then(m => m.StocksComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./features/article/article').then(m => m.ArticleComponent)
      },
      // {
      //   path: 'departements',
      //   loadComponent: () => import('./features/admin/departements/admin-departements').then(m => m.AdminDepartementsComponent)
      // },
      {
        path: 'demandes',
        loadComponent: () => import('./features/demande/demande').then(m => m.DemandeComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ========== USER ROUTES ==========
  {
    path: 'user',
    canActivate: [userGuard],
    children: [
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./features/user/dashboard/user-dashboard').then(m => m.UserDashboardComponent)
      // },
      {
        path: 'articles',
        loadComponent: () => import('./features/article/article').then(m => m.ArticleComponent)
      },
      {
        path: 'demandes',
        loadComponent: () => import('./features/demande/demande').then(m => m.DemandeComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ========== SHARED ROUTES (Both roles) ==========
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashbord/dashbord').then(m => m.DashbordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'articles',
    loadComponent: () => import('./features/article/article').then(m => m.ArticleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stocks',
    loadComponent: () => import('./features/stocks/stocks').then(m => m.StocksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'demandes',
    loadComponent: () => import('./features/demande/demande').then(m => m.DemandeComponent),
    canActivate: [authGuard]
  },

  // ========== 404 ==========
  { path: '**', redirectTo: '' }
];
