import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';


@Component({
  selector: 'app-reset-password',
  imports: [TranslatePipe, FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  passwordType: string = "password";
  repeatPasswordType: string = "password";
  form = {
    pw: "",
    repeatPw: "",
    token: ""
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private feedback: FeedbackOverlayComponent
  ) { }

  resetPassword() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.form.token = token;
      this.http.post('https://videoflix-backend.alexander-hardtke.de/api/change/', this.form).subscribe({
        next: (response: any) => {
          const msg = response?.message || 'Passwort erfolgreich geändert';
          this.feedback.showFeedback(msg);
          setTimeout(() => {
            this.router.navigate(['']);
          }, 1500);
        },
        error: (err) => {
          const error = err.response.error;
          this.feedback.showFeedback(error);
        }
      })
    }
  }

  markAsUntouched(item: NgModel) {
    item.control?.markAsUntouched();
  }

  onMouseDown(svg: HTMLElement, pw: string): void {
    if (pw === 'pw') this.passwordType = 'text';
    else this.repeatPasswordType = 'text';
    const path = svg.querySelector('svg path');
    if (!path) return;
    path.setAttribute('d', SVG_PATHS.visible);
  }

  onMouseUp(svg: HTMLElement, pw: string): void {
    if (pw === 'pw') this.passwordType = 'password';
    else this.repeatPasswordType = 'password';
    const path = svg.querySelector('svg path');
    if (!path) return;
    path.setAttribute('d', SVG_PATHS.invisible);
  }
}