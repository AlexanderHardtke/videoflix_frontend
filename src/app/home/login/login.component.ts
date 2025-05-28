import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';

@Component({
    selector: 'app-login',
    imports: [TranslatePipe, FormsModule, CommonModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    passwordType: string = "password";
    form = {
        email: "",
        pw: ""
    }

    constructor(private router: Router, private http: HttpClient, private feedback: FeedbackOverlayComponent) {}

    loginUser() {
        this.http.post('https://.../api/login/', this.form).subscribe({
            next: (response: any) => {
                const msg = response?.message || 'Erfolgreich angemeldet';
                this.feedback.showFeedback(msg);
                this.form.email = '';
                this.form.pw = '';
                localStorage.setItem('auth', response.token);
                this.router.navigate(['/main']);
            },
            error: (err) => {
                const error = err.response.error;
                this.feedback.showFeedback(error);
            }
        });
    }

    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }

    onMouseDown(svg: HTMLElement): void {
        this.passwordType = 'text';
        const path = svg.querySelector('svg path');
        if (!path) return;
        path.setAttribute('d', SVG_PATHS.visible);
    }

    onMouseUp(svg: HTMLElement): void {
        this.passwordType = 'password';
        const path = svg.querySelector('svg path');
        if (!path) return;
        path.setAttribute('d', SVG_PATHS.invisible);
    }
}
