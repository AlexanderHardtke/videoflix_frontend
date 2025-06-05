import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FeedbackOverlayComponent } from '../../feedback-overlay/feedback-overlay.component';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { Video, VIDEO_CATEGORIES } from '../../services/video.model';


@Component({
    selector: 'app-main-page',
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
    readonly categories = VIDEO_CATEGORIES;
    videosByCategory: Record<string, Video[]> = {
        new: [],
        animals: [],
        nature: [],
        training: [],
        tutorials: []
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService,
        private translate: TranslateService
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
        this.http.get<Video[]>(env.url + 'api/videos/', { headers }).subscribe({
            next: (videos) => this.sortVideos(videos),
            error: (err) => this.errorMessage(err)
        });
    }

    /**
     * sorts the videos in the different categorys to display
     * 
     * @param videos the list of videos from the db
     */
    sortVideos(videos: Video[]) {
        this.resetCategories();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        videos.forEach(video => {
            const uploadedDate = new Date(video.uploaded_at);
            if (uploadedDate >= sevenDaysAgo) this.videosByCategory['new'].push(video);
            if (this.isValidCategory(video.type)) {
                this.videosByCategory[video.type].push(video);
            }
        });
    }

    /**
     * checks if the video.type is in videosByCategory - array
     * 
     * @param type the type of video
     * @returns boolean
     */
    isValidCategory(type: string): type is keyof typeof this.videosByCategory {
        return type in this.videosByCategory;
    }

    /**
     * resets all video category-arrays to empty
     */
    resetCategories() {
        this.videosByCategory = {
            new: [],
            animals: [],
            nature: [],
            training: [],
            tutorials: []
        };
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

    /**
     * plays the preview for the video
     * 
     * @param event mousehover over the video
     */
    playPreview(event: MouseEvent) {
        const video = (event.currentTarget as HTMLElement).querySelector('video');
        if (video && video.dataset['src']) {
            video.src = video.dataset['src'];
            video.play();
        }
    }

    /**
     * stops the preview for the video
     * 
     * @param event leaving mousehover over the video
     */
    stopPreview(event: MouseEvent) {
        const video = (event.currentTarget as HTMLElement).querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.removeAttribute('src');
        }
    }

    /**
     * gets the current selected language and sets the description for the video
     * 
     * @param video a video for display
     * @returns a string for de or en
     */
    getDescriptionLang(video: Video): string {
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'de';
        return currentLang === 'en' ? video.descriptionEN : video.descriptionDE;
    }
}

// Title Video/ wenn kein neues dann erstes in x if logged in move to main
// UNIT Tests KARMA
// Video-player