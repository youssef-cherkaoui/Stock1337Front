import { Component } from '@angular/core';
import {AuthService} from '../../../core/services/auth';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',

})
export class LoginComponent {
  authRequest = {
    email: '',
    password: ''
  };

  constructor(private authService : AuthService, private router: Router) {}

  onLogin(){
    this.authService.login(this.authRequest).subscribe(
      { next : (res) => {
        this.authService.saveSession(res);
        this.router.navigate(res.user.role == 'ADMIN' ? ['/admin'] : ['/user']);
        },
        error : (err) => alert('Login failed'),
      });
  }
}
