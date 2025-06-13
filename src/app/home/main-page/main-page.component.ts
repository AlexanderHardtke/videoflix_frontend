import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList, HostListener } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { Video, VIDEO_CATEGORIES } from '../../services/video.model';
import { BackgroundService } from '../../services/background.service';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';


@Component({
    selector: 'app-main-page',
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrls: [
        './main-page.component.scss',
        '../../../../node_modules/keen-slider/keen-slider.min.css']
})
export class MainPageComponent implements OnInit, AfterViewInit {
    @ViewChildren("sliderRef") sliderRefs!: QueryList<ElementRef<HTMLElement>>
    sliders: KeenSliderInstance[] = [];
    readonly categories = VIDEO_CATEGORIES;
    videosByCategory: Record<string, Video[]> = {
        new: [],
        animals: [],
        nature: [],
        training: [],
        tutorials: []
    };
    backgroundImg = '';
    visibleVideoIndex: { [category: string]: number } = {};
    videosPerView = 8;
    nextPageUrls: { [category: string]: string | null } = {};
    currentScreenWidth = 0;
    minVideosForSlider = {
        mobile: 2,
        tablet: 3, 
        desktop: 4,
        large: 5,
        xlarge: 6
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService,
        private translate: TranslateService,
        private backgroundService: BackgroundService
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
     * subscribes to changes in the sliderRefs and initializes the sliders
     */
    ngAfterViewInit() {
        this.sliderRefs.changes.subscribe(() => this.initializeSliders());
        if (this.hasVideosLoaded()) this.initializeSliders();
    }

    initializeSliders() {
        if (!this.sliderRefs) return;
        this.sliderRefs.forEach((sliderRef, index) => {
            try {
                const slider = new KeenSlider(sliderRef.nativeElement, {
                    loop: true,
                    mode: "free-snap",
                    slides: {
                        perView: "auto",
                        spacing: 16,
                    },
                    breakpoints: {
                        "(max-width: 768px)": {
                            slides: { perView: "auto", spacing: 16 }
                        }
                    }
                });
                this.sliders.push(slider);
            } catch (error) {
                console.error(`Error initializing slider ${index}:`, error);
            }
        });
    }

    ngOnDestroy() {
        this.sliders.forEach(slider => slider.destroy());
        this.sliders = [];
    }

    navigateVideos(category: any, direction: 'left' | 'right') {
        const categoryIndex = this.categories.indexOf(category);
        if (categoryIndex >= 0 && this.sliders[categoryIndex]) {
            if (direction === 'left') this.sliders[categoryIndex].prev();
            else this.sliders[categoryIndex].next();
        }
    }

    getVisibleVideos(category: string): Video[] {
        return this.videosByCategory[category] || [];
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
            if (this.isValidCategory(video.type)) this.videosByCategory[video.type].push(video);
        });
        this.getNewestVideo();
    }

    /**
     * gets the newest video and send it to the backgroundservice
     */
    getNewestVideo() {
        let videoIndex = this.videosByCategory['new'].length - 1;
        this.backgroundImg = this.videosByCategory['new'][videoIndex].bigImage
        this.backgroundService.setDynamicBackground(this.backgroundImg);
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
     * @param event mousehover or focus over on the video
     */
    playPreview(event: MouseEvent | FocusEvent) {
        const video = (event.currentTarget as HTMLElement).querySelector('video');
        const img = (event.currentTarget as HTMLElement).querySelector('img');
        if (video && video.dataset['src']) {
            video.src = video.dataset['src'];
            img?.classList.add('hide');
            video.classList.remove('hide');
            video.play();
        }
    }

    /**
     * stops the preview for the video
     * 
     * @param event leaving mousehover or the focus over the video
     */
    stopPreview(event: MouseEvent | FocusEvent) {
        const video = (event.currentTarget as HTMLElement).querySelector('video');
        const img = (event.currentTarget as HTMLElement).querySelector('img');
        if (video) {
            video.pause();
            video.classList.add('hide')
            img?.classList.remove('hide');
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

    /**
     * navigates to a single video with thr url
     * 
     * @param videoUrl the url for the choosen video
     */
    playVideo(videoUrl: string) {
        this.router.navigate(['/video'], {
            queryParams: { url: videoUrl }
        });
    }

    /**
     * checks if the videos for each category are loaded
     * 
     * @returns boolean
     */
    hasVideosLoaded(): boolean {
        return Object.values(this.videosByCategory).some(videos => videos.length > 0);
    }
    
    /**
     * Listener für das verändern der Browsergröße
     */
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.updateScreenWidth();
        // Slider neu initialisieren bei Bildschirmgrößenänderung
        this.reinitializeSliders();
    }

    /**
     * Aktualisiert die aktuelle Browsergröße
     */
    updateScreenWidth() {
        this.currentScreenWidth = window.innerWidth;
    }

    /**
     * Bestimmt die minimale Anzahl Videos basierend auf der Browsergröße
     */
    private getMinVideosForCurrentScreen(): number {
        if (this.currentScreenWidth <= 480) {
            return this.minVideosForSlider.mobile;
        } else if (this.currentScreenWidth <= 768) {
            return this.minVideosForSlider.tablet;
        } else if (this.currentScreenWidth <= 1920) {
            return this.minVideosForSlider.desktop;
        } else if (this.currentScreenWidth <= 3000) {
            return this.minVideosForSlider.large;
        } else {
            return this.minVideosForSlider.xlarge;
        }
    }

    /**
     * Prüft ob für eine Kategorie genügend Videos für Slider vorhanden sind
     */
    shouldShowSlider(category: string): boolean {
        const videos = this.videosByCategory[category];
        const minVideos = this.getMinVideosForCurrentScreen();
        return videos && videos.length >= minVideos;
    }

    /**
     * Slider neu initialisieren
     */
    private reinitializeSliders() {
        // Bestehende Slider zerstören
        this.sliders.forEach(slider => slider.destroy());
        this.sliders = [];
        
        // Kurz warten und dann neu initialisieren
        setTimeout(() => {
            this.initializeSliders();
        }, 100);
    }
}