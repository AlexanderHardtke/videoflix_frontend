import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';


@Component({
    selector: 'app-forgot-password',
    imports: [TranslatePipe, FormsModule, CommonModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    isLoading = false;
    form = {
        email: '',
        lang: '',
    }

    constructor(private router: Router, private translate: TranslateService, private http: HttpClient, private feedback: FeedbackService) { }

    /**
     * requests an email from the backend to reset the users password
     */
    sendEmail() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.form.lang = this.translate.currentLang || this.translate.getDefaultLang();
        this.http.post(env.url + 'api/reset/', this.form).subscribe({
            next: (response: any) => {
                this.successMail(response)
            },
            error: (err) => {
                this.feedback.showError(err.error.error);
                this.isLoading = false;
            }
        });
    }

    /**
     * shows the successfull sending of the email in the backend and navigates the user to /check
     * 
     * @param response 
     */
    successMail(response: any) {
        const msg = response?.message || 'E-Mail erfolgreich gesendet.';
        this.feedback.showFeedback(msg);
        this.router.navigate(['/check']);
        this.form.email = '';
        this.isLoading = false;
    }

    /**
     * Controls the input fields in the form and mark it as untouched if the user is not active in the form
     * 
     * @param item the item to mark
     */
    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }

}
