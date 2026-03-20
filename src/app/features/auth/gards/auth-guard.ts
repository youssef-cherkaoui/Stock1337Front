import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn$) {

    if (authService.getToken()) {
      return true;
    }
  }

  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }


  router.navigate(['/user/dashboard']);
  return false;
};

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isUser()) {
    return true;
  }


  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  if (!token) {
    return true;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/user/dashboard']);
  }

  return false;
};
