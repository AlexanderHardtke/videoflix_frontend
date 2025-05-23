import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';


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
        repeatPw: ""
    }

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

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

  resetPassword() {
    console.log(this.form)
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