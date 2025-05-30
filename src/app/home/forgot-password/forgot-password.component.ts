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
    form = {
        email: '',
        lang: '',
    }

    constructor(private router: Router, private translate: TranslateService, private http: HttpClient, private feedback: FeedbackService) { }

    /**
     * requests an email from the backend to reset the users password
     */
    sendEmail() {
        this.form.lang = this.translate.currentLang || this.translate.getDefaultLang();

        this.http.post(env.url + 'api/reset/', this.form).subscribe({
            next: (response: any) => {
                const msg = response?.message || 'E-Mail erfolgreich gesendet.';
                this.feedback.showFeedback(msg);
                this.form.email = '';
            },
            error: (err) => {
                const error = err.response.error;
                this.feedback.showFeedback(error);
            }
        });
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
