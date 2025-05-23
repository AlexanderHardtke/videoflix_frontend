import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [TranslatePipe, FormsModule, CommonModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    form = {
        email: ""
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

    constructor(private router: Router, private translate: TranslateService) { }

    sendEmail() {
        const lang = this.translate.currentLang || this.translate.getDefaultLang();
        console.log(this.form.email);
        console.log(lang);
        // setTimeout(() => {
        //     this.router.navigate(['']);
        // }, 1500);
    }

    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }
}
