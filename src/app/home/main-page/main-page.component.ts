import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';
import { Router } from '@angular/router';

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
        private feedback: FeedbackOverlayComponent
    ) { }

    ngOnInit() {
        const token = localStorage.getItem('auth');
        if (!token) {
            this.feedback.showErrorText('Kein Token gefunden, Zugriff verweigert');
            this.router.navigate(['']);
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get('https://videoflix-backend.alexander-hardtke.de/api/videos/', { headers }).subscribe({
            next: (response: any) => {
                console.log(response);// Setze hier die Videos
            },
            error: (err) => {
                const error = err?.error?.detail || 'Fehler beim laden der Videos';
                this.feedback.showErrorText(error);
            }
        })
    }
}
