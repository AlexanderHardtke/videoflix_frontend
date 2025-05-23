import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-forgot-password',
    imports: [TranslatePipe, FormsModule, CommonModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    form = {
        email: ''
    }
    post = {
        endPoint: 'https://videoflix.alexander-hardtke.com/send-reset-link.php',
        body: (payload: any) => JSON.stringify(payload),
        options: {
            headers: {
                'Content-Type': 'text/plain',
                responseType: 'text',
            },
        },
    };

    constructor(private router: Router, private translate: TranslateService, private http: HttpClient,) { }

    sendEmail() {
        const token = this.generateToken();
        const lang = this.translate.currentLang || this.translate.getDefaultLang();
        this.sendEmailWithToken(this.form.email, token);
        this.form.email = '';



        console.log(lang);
        // this.feedbackOverlay.showFeedback('E-Mail gesendet');
        // setTimeout(() => {
        //     this.router.navigate(['']);
        // }, 1500);
    }

    /**
    * Generates a random 32-byte token as a hexadecimal string.
    * @returns {string} - The generated token.
    */
    generateToken(): string {
        let randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        return Array.from(randomBytes)
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
    * Sends an email with the token to the specified address.
    * @param {string} email - The recipient's email address.
    * @param {string} token - The token to include in the email.
    */
    sendEmailWithToken(email: string, token: string): void {
        let body = { email, token };
        this.http.post(this.post.endPoint, this.post.body(body)).subscribe({});
    }

    // async updateUserWithToken() {}

    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }

}
