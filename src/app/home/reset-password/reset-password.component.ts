import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    imports: [],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
    constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}


ngOnInit() {
    console.log("test");
    
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.http.post('/api/reset-password/', { token }).subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/error']),
      });
    }
  }
}