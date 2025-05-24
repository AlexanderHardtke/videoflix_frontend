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

    /**
     * gets the email from the start-page to the sign-up-page and clears the field
     */
    ngOnInit() {
        this.form.email = this.regService.getEmail();
        this.regService.clear();
    }

    registerUser() {
        this.form.lang = this.translate.currentLang || this.translate.getDefaultLang();
        this.http.post('https://videoflix-backend.alexander-hardtke.de/api/register/', this.form)
            .subscribe(response => {
                // this.feedbackOverlay.showFeedback(response);
                setTimeout(() => {
                    this.router.navigate(['']);
                }, 1500);
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

    /**
     * changes the svg of the password or repeatpassword field and shows the password to the user on mousedown
     * 
     * @param svg the svg-element that is currently in use
     * @param pw the string pw or repeatPw to check both input fields
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
     * changes the svg of the password field and hides the password to the user on mouseup or mouseleave
     * 
     * @param svg the svg-element that is currently in use
     * @param pw the string pw or repeatPw to check both input fields
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