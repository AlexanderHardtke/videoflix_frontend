import { Component, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-privacy-policy',
    imports: [TranslatePipe],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class PrivacyPolicyComponent {

}
