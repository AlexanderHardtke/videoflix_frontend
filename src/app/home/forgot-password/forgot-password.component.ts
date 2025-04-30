import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

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
    


    sendEmail() {
        console.log(this.form.email);
    }

    markAsUntouched(item: NgModel) {
        item.control?.markAsUntouched();
    }
}
