import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';

@Component({
    selector: 'app-main-page',
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
    chooseVid = ["new", "documentary", "Drama", "Sci-Fi", "Action"]
    kekse = ["Keks"]

    constructor(private http: HttpClient, private feedback: FeedbackOverlayComponent) { }

    ngOnInit() {
        this.http.get('https://videoflix-backend.alexander-hardtke.de/api/videos/').subscribe({
            next: (response: any) => {
                // Setze hier die Videos
            },
            error: (err) => {
                const error = err.response.error;
                this.feedback.showFeedback(error);
            }
        })
    }

}
