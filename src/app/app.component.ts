import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { FeedbackOverlayComponent } from "./feedback-overlay/feedback-overlay.component";
import { BackgroundComponent } from './background/background.component';
import { BackgroundService } from './services/background.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    FeedbackOverlayComponent,
    BackgroundComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit{
  title = 'videoflix_frontend';

  constructor(private router: Router, private backgroundService: BackgroundService) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe(event => {
      this.backgroundService.setBackgroundForRoute(event.urlAfterRedirects);
    });
  }
}
