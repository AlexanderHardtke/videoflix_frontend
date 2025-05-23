import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup-confirm',
  imports: [],
  templateUrl: './signup-confirm.component.html',
  styleUrl: './signup-confirm.component.scss'
})
export class SignupConfirmComponent {
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    console.log("test");
    
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.http.post('/api/confirm-email/', { token }).subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/error']),
      });
    }
  }
}