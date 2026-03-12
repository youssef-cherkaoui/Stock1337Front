import { Component } from '@angular/core';
import {AuthService} from '../../../core/services/auth';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule, CommonModule,RouterModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  registerRequest = {
    Name : '',
    Email : '',
    Password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    return this.authService.register(this.registerRequest,'/register/user').subscribe({
      next:(res) => {
        alert('Account Created ! Welcome');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Try again later');
      }
    });
  }
}
