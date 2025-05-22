import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { RegistrationService } from '../../services/registration.service';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [TranslatePipe, FormsModule, CommonModule],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
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

    registerUser() {
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