import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

@Component({
    selector: 'app-footer',
    imports: [TranslatePipe, RouterLink, NgClass],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    currentUrl = '';

    constructor(private router: Router) {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.currentUrl = event.urlAfterRedirects;
            });
    }
}
