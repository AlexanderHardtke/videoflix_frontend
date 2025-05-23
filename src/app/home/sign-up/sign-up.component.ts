import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { RegistrationService } from '../../services/registration.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
    selector: 'app-sign-up',
    imports: [TranslatePipe, FormsModule, CommonModule],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
    sendMail: boolean = false;
    passwordType: string = "password";
    repeatPasswordType: string = "password";
    form = {
        email: "",
        pw: "",
        repeatPw: "",
        lang: "",
    }

    constructor(private regService: RegistrationService, private http: HttpClient, private translate: TranslateService, private router: Router) { }

    ngOnInit() {
        this.form.email = this.regService.getEmail();
        this.regService.clear();
    }

    enableButton(isValid: boolean | null | undefined): void {
        this.sendMail = !!isValid;
    }

    registerUser() {
        this.form.lang = this.translate.currentLang || this.translate.getDefaultLang();
        this.http.post('https://videoflix-backend.alexander-hardtke.de/api/register/', this.form)
            .subscribe(response => {
                console.log("YEEAAAH");
                // this.feedbackOverlay.showFeedback(response);
                setTimeout(() => {
                    this.router.navigate(['']);
                }, 1500);
            });
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