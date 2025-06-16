import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList, HostListener, Directive } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { Video, VideoApiResponse, VIDEO_CATEGORIES } from '../../services/video.model';
import { BackgroundService } from '../../services/background.service';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';
import { debounceTime } from 'rxjs';


@Component({
    selector: 'app-main-page',
    imports: [TranslatePipe],
    templateUrl: './main-page.component.html',
    styleUrls: [
        './main-page.component.scss',
        '../../../../node_modules/keen-slider/keen-slider.min.css']
})
export class MainPageComponent implements OnInit, AfterViewInit {
    @ViewChildren('lazyVideo') lazyVideos!: QueryList<ElementRef<HTMLVideoElement>>;
    @ViewChildren("sliderRef") sliderRefs!: QueryList<ElementRef<HTMLElement>>
    sliders: KeenSliderInstance[] = [];
    nextPageUrls: { [category: string]: string | null } = {};
    readonly categories = VIDEO_CATEGORIES;
    videosByCategory: Record<string, Video[]> = {
        new: [],
        animals: [],
        nature: [],
        training: [],
        tutorials: []
    };
    backgroundImg = '';
    currScreenWidth = 0;
    minVidForRes = {
        xsmall: 2,
        small: 3,
        medium: 4,
        large: 5,
        xlarge: 6
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService,
        private translate: TranslateService,
        private backgroundService: BackgroundService,
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
     * initializes lazyloading and sliders and then subscribes to changes in the sliderRefs and initializes the sliders
     */
    ngAfterViewInit() {
        this.initLazyVideoLoading();
        this.initializeSliders();
        this.sliderRefs.changes.subscribe(() => this.reinitializeSliders());
    }

    /**
     * initializes lazy video loading
     */
    initLazyVideoLoading() {
        const observer = new IntersectionObserver(([entry], obs) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
                const src = video.dataset['src'];
                if (src) video.src = src;
                console.log('📹 Lazy loading video:', src);
                obs.unobserve(video);
            }
        }, { threshold: 0.25 });
        this.lazyVideos.forEach(ref => observer.observe(ref.nativeElement));
    }

    /**
     * destroys all sliders on exiting the main-page
     */
    ngOnDestroy() {
        this.sliders.forEach(slider => slider.destroy());
        this.sliders = [];
    }

    /**
     * navigates the the video left or right
     * 
     * @param category 
     * @param direction 
     */
    navigateVideos(category: string, direction: 'left' | 'right') {
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
        this.http.get<VideoApiResponse>(env.url + 'api/videos/', { headers }).subscribe({
            next: (videos) => this.sortVideos(videos),
            error: (err) => this.errorMessage(err)
        });
    }

    /**
     * sorts the videos in the different categorys to display
     * 
     * @param videos the list of videos from the db
     */
    sortVideos(data: VideoApiResponse) {
        const videos: Video[] = data.list;
        this.resetCategories();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        videos.forEach(video => {
            const uploadedDate = new Date(video.uploaded_at);
            if (uploadedDate >= sevenDaysAgo) this.videosByCategory['new'].push(video);
            if (this.isValidCategory(video.video_type)) this.videosByCategory[video.video_type].push(video);
        });
        this.getNewestVideo();
    }

    /**
     * gets the newest video and send it to the backgroundservice
     */
    getNewestVideo() {
        let videoIndex = this.videosByCategory['new'].length - 1;
        this.backgroundImg = this.videosByCategory['new'][videoIndex].big_image
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
    errorMessage(err: HttpErrorResponse) {
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
        return currentLang === 'en' ? video.description_en : video.description_de;
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
     * Listener für das verändern der Browsergröße
     */
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.updateScreenWidth();
        this.reinitializeSliders();
    }

    /**
     * Aktualisiert die aktuelle Browsergröße
     */
    updateScreenWidth() {
        this.currScreenWidth = window.innerWidth;
    }

    /**
     * Bestimmt die minimale Anzahl Videos basierend auf der Browsergröße
     */
    getMinVideosForCurrentScreen(): number {
        if (this.currScreenWidth <= 400) return this.minVidForRes.xsmall;
        else if (this.currScreenWidth <= 700) return this.minVidForRes.small;
        else if (this.currScreenWidth <= 1100) return this.minVidForRes.medium;
        else if (this.currScreenWidth <= 1920) return this.minVidForRes.large;
        else return this.minVidForRes.xlarge;
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
    reinitializeSliders() {
        this.sliders.forEach(slider => slider.destroy());
        this.sliders = [];
        setTimeout(() => this.initializeSliders(), 100);
    }

    initializeSliders() {
        if (!this.sliderRefs) return;
        this.sliderRefs.forEach((sliderRef, index) => {
            try {
                const slider = new KeenSlider(sliderRef.nativeElement, {
                    loop: true,
                    mode: "snap",
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
}