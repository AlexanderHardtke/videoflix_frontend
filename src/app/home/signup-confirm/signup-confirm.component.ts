import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { env } from '../../../../src/environments/environment';
import { FeedbackService } from '../../services/feedback.service';


@Component({
  selector: 'app-signup-confirm',
  imports: [TranslatePipe],
  templateUrl: './signup-confirm.component.html',
  styleUrl: './signup-confirm.component.scss'
})
export class SignupConfirmComponent {
  errorMsg = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private feedback: FeedbackService
  ) { }

  /**
   * sends the token to the backend and confirms the user in the database,
   * then moves the user to the login page
   * 
   */
  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    const lang = localStorage.getItem('lang') || 'en';
    if (token) {
      const headers = new HttpHeaders({ 'Accept-Language': lang });
      this.http.get(`${env.url}api/confirm/?code=${token}`, { headers }).subscribe({
        next: (response: any) => {
          const msg = response?.message || 'Erfolgreich bestätigt';
          this.feedback.showFeedback(msg);
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: () => this.errorMsg = true
      });
    }
  }
}