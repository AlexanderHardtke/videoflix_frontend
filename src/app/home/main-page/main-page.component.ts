import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-main-page',
    standalone: true,
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
    chooseVid = ["new", "documentary", "Drama", "Sci-Fi", "Action"]
    kekse = ["Keks"]

}
