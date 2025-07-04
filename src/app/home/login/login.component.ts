import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { RegistrationService } from '../../services/registration.service';


@Component({
    selector: 'app-login',
    imports: [TranslatePipe, FormsModule, CommonModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    isLoading = false;
    passwordType: string = 'password';
    form = {
        email: "",
        password: ""
    }

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService,
        private registration: RegistrationService
    ) { }

    /**
     * requests a login Cookie from the api and routes the user to the main page
     */
    loginUser() {
        if (this.isLoading) return;
        this.isLoading = true;
        const lang = localStorage.getItem('lang') || 'en';
        const headers = new HttpHeaders({ 'Accept-Language': lang });
        this.http.post(env.url + 'api/login/', this.form, { headers }).subscribe({
            next: (response: any) => this.successLogin(response),
            error: (err) => {
                this.feedback.showError(err.error.error);
                this.isLoading = false;
            }
        });
    }

    /**
     * successfully logs in the user and moves him to the /main page
     * 
     * @param response 
     */
    successLogin(response: any) {
        this.registration.auth = true;
        const msg = response?.message || 'Erfolgreich angemeldet';
        this.feedback.showFeedback(msg);
        this.router.navigate(['/main']);
        this.form.email = '';
        this.form.password = '';
        this.isLoading = false;
    }

    /**
     * marks the input field as untouched
     * 
     * @param item an input field
     */
    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }

    /**
     * shows the passwort input typed in by the user
     * 
     * @param svg the icon that is changed
     * @returns 
     */
    showPassword(svg: HTMLElement): void {
        this.passwordType = 'text';
        const path = svg.querySelector('svg path');
        if (!path) return;
        path.setAttribute('d', SVG_PATHS.visible);
    }

    /**
     * hides the password input typed in by the user
     * 
     * @param svg the icon that is changed
     * @returns 
     */
    hidePassword(svg: HTMLElement): void {
        this.passwordType = 'password';
        const path = svg.querySelector('svg path');
        if (!path) return;
        path.setAttribute('d', SVG_PATHS.invisible);
    }
}
