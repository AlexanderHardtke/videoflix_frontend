import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-start-page',
    standalone: true,
    imports: [TranslatePipe, FormsModule],
    templateUrl: './start-page.component.html',
    styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
    email:string = "";

    moveToRegister(email:string) {
        console.log(email);
    }
}
