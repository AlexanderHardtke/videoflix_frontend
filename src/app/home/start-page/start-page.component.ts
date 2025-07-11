import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RegistrationService } from '../../services/registration.service';

@Component({
    selector: 'app-start-page',
    imports: [TranslatePipe, FormsModule],
    templateUrl: './start-page.component.html',
    styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
    emailInput:string = ''

    constructor(private regService: RegistrationService, private router: Router) {}

    /**
     * moves the user to the signUp page
     * 
     * @param email the email that the user has typed in already
     */
    moveToRegister(email: string) {
        this.regService.setEmail(email);
        this.router.navigate(['/signUp']);
    }
}
