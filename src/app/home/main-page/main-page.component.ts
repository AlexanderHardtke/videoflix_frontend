import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList, HostListener, Directive } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { Video, VideoApiResponse, VIDEO_CATEGORIES } from '../../services/video.model';
import { BackgroundService } from '../../services/background.service';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';
import { VideoTransferService } from '../../services/video-transfer.service';


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
    categorySliders: { [category: string]: KeenSliderInstance } = {};
    sliders: KeenSliderInstance[] = [];
    categories = VIDEO_CATEGORIES;
    sliderPositions: Record<string, number> = {};
    videosByCategory: Record<string, Video[]> = Object.fromEntries(
        VIDEO_CATEGORIES.map(category => [category, []])
    );
    minVidForRes = [
        { maxWidth: 400, minVideos: 2 },
        { maxWidth: 700, minVideos: 3 },
        { maxWidth: 1100, minVideos: 4 },
        { maxWidth: 1920, minVideos: 5 },
        { maxWidth: Infinity, minVideos: 6 }
    ];
    nextPage: string | null = null;
    currScreenWidth = 0;
    atfVideo: Video | null = null;
    isMobile = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private feedback: FeedbackService,
        private translate: TranslateService,
        private backgroundService: BackgroundService,
        private videoTrans: VideoTransferService
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
        this.resetCategories();
        this.getVideos(token);
    }

    /**
     * initializes lazyloading and sliders and then subscribes to changes in the sliderRefs and initializes the sliders
     */
    ngAfterViewInit() {
        this.sliderRefs.changes.subscribe(() => this.reinitializeSliders());
        this.lazyVideos.changes.subscribe(() => this.initLazyVideoLoading());
        this.updateScreenWidth();
    }

    /**
     * initializes lazy video loading
     */
    initLazyVideoLoading() {
        const observer = new IntersectionObserver(([entry], obs) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
                const src = video.dataset['src'];
                if (src && !video.src) {
                    video.src = src;
                }
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
        const slider = this.categorySliders[category];
        if (slider) {
            if (direction === 'left') slider.prev();
            else slider.next();
        } else console.warn(`No slider found for category ${category}`);
    }

    getVisibleVideos(category: string): Video[] {
        return this.videosByCategory[category] || [];
    }

    /**
     * gets the video from the backend
     */
    async getVideos(token: string) {
        const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
        if (!this.nextPage) this.nextPage = env.url + 'api/videos/';
        this.http.get<VideoApiResponse>(this.nextPage, { headers }).subscribe({
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
        this.nextPage = data.next;
        const videos: Video[] = data.list;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        videos.forEach(video => {
            const uploadedDate = new Date(video.uploaded_at);
            if (uploadedDate >= sevenDaysAgo && this.videosByCategory['new'].length < 10) {
                this.videosByCategory['new'].push(video);
            }
            if (this.isValidCategory(video.video_type)) {
                this.videosByCategory[video.video_type].push(video);
                setTimeout(() => {
                    this.categorySliders[video.video_type]?.update();
                }, 0);
            }
        });
        this.getNewestVideo();
    }

    /**
     * gets the newest video and send it to the backgroundservice
     */
    getNewestVideo() {
        this.atfVideo = this.videosByCategory['new'][0];
        if (this.isMobile) {
            this.backgroundService.setDynamicBackground('');
        } else this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
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
        localStorage.removeItem('auth');
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
            video.muted = true;
            video.src = video.dataset['src'];
            img?.classList.add('hide');
            video.classList.remove('hide');
            video.play().catch(err => {
                if (err.name !== 'AbortError') console.warn('Video konnte nicht abgespielt werden:', err);
            });
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
     * puts the Video the user has choosen to the atf section
     * 
     * @param video a video for display
     */
    putVideoAtf(video: Video) {
        this.atfVideo = video;
        if (this.isMobile && this.atfVideo) {
            this.videoTrans.setVideo(this.atfVideo);
            this.router.navigate(['/info']);
        } else {
            this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
        }
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
     * Aktualisiert die aktuelle Browsergröße, wenn mobile entfernt das Titelbild
     */
    updateScreenWidth() {
        this.currScreenWidth = window.innerWidth;
        if (this.currScreenWidth > 768) {
            this.isMobile = false;
            if (this.atfVideo) this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
        }
        else {
            this.isMobile = true;
            this.backgroundService.setDynamicBackground('');
        }
    }

    /**
     * Bestimmt die minimale Anzahl Videos basierend auf der Browsergröße
     */
    getMinVideosForCurrentScreen(): number {
        const screenWidth = this.currScreenWidth;
        for (const breakpoint of this.minVidForRes) {
            if (screenWidth <= breakpoint.maxWidth) return breakpoint.minVideos;
        }
        return 0;
    }

    /**
     * Prüft ob für eine Kategorie genügend Videos für Slider vorhanden sind
     */
    shouldShowSlider(cat: string): boolean {
        const videos = this.videosByCategory[cat];
        const minVideos = this.getMinVideosForCurrentScreen();
        return videos && videos.length >= minVideos;
    }

    /**
     * Slider neu initialisieren und den index speichern
     */
    reinitializeSliders() {
        this.sliders.forEach((slider, index) => {
            const category = this.categories.filter(cat => this.shouldShowSlider(cat))[index];
            if (slider) {
                this.sliderPositions[category] = slider.track.details.rel;
                slider.destroy();
            }
        });
        this.sliders = [];
        setTimeout(() => this.initializeSliders(), 100);
    }

    /**
     * initialize the keensliders for each category
     * 
     * @returns null if slider haqs no ref
     */
    initializeSliders() {
        if (!this.sliderRefs) return;
        const sliderCategories = this.categories.filter(cat => this.shouldShowSlider(cat));
        this.sliderRefs.forEach((sliderRef, index) => {
            try {
                const category = sliderCategories[index];
                this.createSlider(sliderRef, category);
            } catch (error) {
                console.error(`Error initializing slider ${index}:`, error);
            }
        });
    }

    /**
     * creates a new slider 
     * 
     * @param sliderRef 
     * @param category 
     */
    createSlider(sliderRef: ElementRef, category: string) {
        const loopEnabled = this.nextPage === null;
        const savedIndex = this.sliderPositions[category] ?? 0;
        const slider = new KeenSlider(sliderRef.nativeElement, {
            loop: loopEnabled, mode: "snap", slides: { perView: "auto", spacing: 16 }, initial: savedIndex,
            created: (sliderInstance) => {
                if (sliderInstance.track.details.slides.length - 1) {
                    this.observeLastSlide(sliderRef.nativeElement);
                }
            }
        });
        this.categorySliders[category] = slider;
        this.sliders.push(slider);
    }

    /**
     * sets an Observer on the slider to determine if the user has reached the last one
     * then gets the next videos and reinitilaizes the slider
     * 
     * @param sliderElement 
     * @returns 
     */
    observeLastSlide(sliderElement: HTMLElement) {
        const slides = sliderElement.querySelectorAll('.keen-slider__slide');
        const lastSlide = slides[slides.length - 2];
        if (!lastSlide) return;
        const observer = new IntersectionObserver(async (entries, obs) => {
            if (entries[0].isIntersecting && this.nextPage) {
                obs.disconnect();
                const token = localStorage.getItem('auth');
                if (token) await this.getVideos(token);
                this.reinitializeSliders();
            }
        }, { threshold: 1.0 });
        observer.observe(lastSlide);
    }
}