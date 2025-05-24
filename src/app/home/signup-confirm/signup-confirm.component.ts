import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-signup-confirm',
  imports: [TranslatePipe],
  templateUrl: './signup-confirm.component.html',
  styleUrl: './signup-confirm.component.scss'
})
export class SignupConfirmComponent {
  errorMsg = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  /**
   * sends the token to the backend and confirms the user in the database
   * 
   */
  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.http.post('/api/confirm/', { token }).subscribe({
        next: () => setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500),
        error: () => this.errorMsg = true
      });
    }
  }
}