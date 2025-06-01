import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';

@Component({
    selector: 'app-main-page',
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
    chooseVid = ["new", "documentary", "Drama", "Sci-Fi", "Action"]
    kekse = ["Keks"]

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService
    ) { }

    /**
     * gets the Videos for the main-page and displays them for the user
     * 
     * @returns 
     */
    ngOnInit() {
        const token = localStorage.getItem('auth');
        if (!token) {
            this.feedback.showError('Kein Token gefunden, Zugriff verweigert');
            this.router.navigate(['']);
            return
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get(env.url + 'api/videos/', { headers }).subscribe({
            next: (response: any) => {
                console.log(response);// Setze hier die Videos
            },
            error: (err) => {
                const error = err?.error?.detail || 'Fehler beim laden der Videos';
                this.feedback.showError(error);
            }
        })
    }
}

// UNIT Tests KARMA
//main.ts
// Video-player