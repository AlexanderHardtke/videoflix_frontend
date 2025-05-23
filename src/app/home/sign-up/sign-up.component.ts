import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { RegistrationService } from '../../services/registration.service';

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
        repeatPw: ""
    }

    constructor(private regService: RegistrationService) { }

    ngOnInit() {
        this.form.email = this.regService.getEmail();
        this.regService.clear();
    }

    enableButton(isValid: boolean | null | undefined): void {
        this.sendMail = !!isValid;
    }

    registerUser() {
        console.log(this.form)
        // if (this.sendMail && this.emailText) {
        //     let token = this.generateToken();
        //     this.sendEmailWithToken(this.emailText, token);
        //     this.updateUserWithToken(this.emailText, token);
        //     this.emailText = '';
        //     this.enableButton(false)
        //     this.showError = false;
        //     this.feedbackOverlay.showFeedback('E-Mail gesendet');
        //     setTimeout(() => {
        //         this.router.navigate(['']);
        //     }, 1500);
        // }
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