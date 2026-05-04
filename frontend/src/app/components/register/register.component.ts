import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; error = ''; loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.error = '';
    if (!this.name || !this.email || !this.password) { this.error = 'Please fill in all fields'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters'; return; }
    this.loading = true;
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.error = err.error?.error || 'Registration failed'; this.loading = false; }
    });
  }
}