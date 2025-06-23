import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';


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
    private feedback: FeedbackService
  ) { }

  /**
   * sends an request to the api with the current token to change the password of the user
   */
  resetPassword() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.form.token = token;
      const lang = localStorage.getItem('lang') || 'en';
      const headers = new HttpHeaders({ 'Accept-Language': lang });
      this.http.post(env.url + 'api/change/', this.form, { headers }).subscribe({
        next: (response: any) => {
          const msg = response?.message || 'Passwort erfolgreich geändert';
          this.feedback.showFeedback(msg);
          setTimeout(() => this.router.navigate(['']), 1500);
        },
        error: (err) => this.feedback.showError(err.error.error)
      });
    }
  }

  /**
  * Controls the input fields in the form and mark it as untouched if the user is not active in the form
  * 
  * @param item the item to mark
  */
  markAsUntouched(item: NgModel) {
    item.control?.markAsUntouched();
  }

  /**
   * shows the passwort input typed in by the user
   * 
   * @param svg the icon that is changed
   * @param pw the name of the input field
   * @returns 
   */
  showPassword(svg: HTMLElement, pw: string): void {
    if (pw === 'pw') this.passwordType = 'text';
    else this.repeatPasswordType = 'text';
    const path = svg.querySelector('svg path');
    if (!path) return;
    path.setAttribute('d', SVG_PATHS.visible);
  }

  /**
   * hides the password input typed in by the user
   * 
   * @param svg the icon that is changed
   * @param pw the name of the input field
   * @returns 
   */
  hidePassword(svg: HTMLElement, pw: string): void {
    if (pw === 'pw') this.passwordType = 'password';
    else this.repeatPasswordType = 'password';
    const path = svg.querySelector('svg path');
    if (!path) return;
    path.setAttribute('d', SVG_PATHS.invisible);
  }
}