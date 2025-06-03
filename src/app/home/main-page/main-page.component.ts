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
     * checks for a token and either rejects the user or gets the videos
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
        this.getVideos(token);
    }

    /**
     * gets the video from the backend
     */
    getVideos(token: string) {
        const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
        this.http.get(env.url + 'api/videos/', { headers }).subscribe({
            next: (response: any) => {
                console.log(response);// Setze hier die Videos
            },
            error: (err) => this.errorMessage(err)
        });
    }

    /**
     * shows the error message for the user and moves him to the start page
     * 
     * @param err 
     */
    errorMessage(err: any) {
        const error = err?.error?.error || 'Fehler beim laden der Videos';
        this.feedback.showError(error);
        this.router.navigate(['']);
    }
}

// UNIT Tests KARMA
//main.ts
// Video-player