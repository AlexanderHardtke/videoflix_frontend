import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList, HostListener } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { env } from '../../../../src/environments/environment';
import { Video, VideoApiResponse, VIDEO_CATEGORIES, minVidForRes } from '../../services/video.model';
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
    nextPage: string | null = null;
    currScreenWidth = 0;
    atfVideo: Video | null = null;
    isMobile = false;
    lastSlideObservers: IntersectionObserver[] = [];
    private token: string | null = null;

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
     */
    ngOnInit() {
        this.token = localStorage.getItem('auth');
        if (!this.token) {
            this.feedback.showError(this.translate.instant('error.noToken'));
            this.router.navigate(['']);
            return
        }
        this.resetCategories();
        this.getVideos(this.token);
        this.updateScreenWidth();
    }

    /**
     * initializes lazyloading and sliders and then subscribes to changes in the sliderRefs and initializes the sliders
     */
    ngAfterViewInit() {
        this.sliderRefs.changes.subscribe(() => this.reinitializeSliders());
        this.lazyVideos.changes.subscribe(() => this.initLazyVideoLoading());
    }

    /**
     * destroys all sliders on exiting the main-page
     */
    ngOnDestroy() {
        this.sliders.forEach(slider => slider.destroy());
        this.sliders = [];
        this.lastSlideObservers.forEach(observer => observer.disconnect());
        this.lastSlideObservers = [];
    }

    /**
     * initializes lazy video loading
     */
    initLazyVideoLoading() {
        const observer = new IntersectionObserver(([entry], obs) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
                const src = video.dataset['src'];
                if (src && !video.src) video.src = src;
                obs.unobserve(video);
            }
        }, { threshold: 0.25 });
        this.lazyVideos.forEach(ref => observer.observe(ref.nativeElement));
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
        } else console.warn(this.translate.instant('error.noToken') + `${category}`);
    }

    /**
     * geres the videos sorted by the category
     * 
     * @param category
     * @returns videos-array
     */
    getVisibleVideos(category: string): Video[] {
        return this.videosByCategory[category] || [];
    }

    /**
     * gets the video from the backend
     */
    async getVideos(token: string) {
        const lang = localStorage.getItem('lang') || 'en';
        const headers = new HttpHeaders()
            .set('Authorization', `Token ${token}`)
            .set('Accept-Language', lang);
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
            if (uploadedDate >= sevenDaysAgo && this.videosByCategory['new'].length < 10
                && !this.videosByCategory['new'].some(vid => vid.url === video.url)
            ) this.videosByCategory['new'].push(video);
            if (this.isValidCategory(video.video_type) && !this.videosByCategory[video.video_type].some(vid => vid.url === video.url)) {
                this.videosByCategory[video.video_type].push(video);
                setTimeout(() => this.categorySliders[video.video_type]?.update(), 0);
            }
        });
        this.getNewestVideo();
    }

    /**
     * gets the newest video and send it to the backgroundservice
     */
    getNewestVideo() {
        this.atfVideo = this.videosByCategory['new'][0];
        if (this.isMobile) this.backgroundService.setDynamicBackground('');
        else this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
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
                if (err.name !== 'AbortError') console.warn(this.translate.instant('error.videoPlay'), err);
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
        this.router.navigate(['/video'], { queryParams: { url: videoUrl } });
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
        } else this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
    }

    /**
     * event listener for resizing the brwoser window to adjust the sliders
     */
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.updateScreenWidth();
        this.reinitializeSliders();
    }

    /**
     * updates the screen width and setss the dynamic background if user is on mobile
     */
    updateScreenWidth() {
        this.currScreenWidth = window.innerWidth;
        if (this.currScreenWidth < 769 || this.currScreenWidth < 1025 && window.innerHeight < 769) {
            this.isMobile = true;
            this.backgroundService.setDynamicBackground('');
        }
        else {
            this.isMobile = false;
            if (this.atfVideo) this.backgroundService.setDynamicBackground(this.atfVideo.big_image);
        }
    }

    /**
     * get the minimum videos for the current screen size to be slided
     */
    getMinVideosForCurrentScreen(): number {
        const screenWidth = this.currScreenWidth;
        for (const breakpoint of minVidForRes) {
            if (screenWidth <= breakpoint.maxWidth) return breakpoint.minVideos;
        }
        return 0;
    }

    /**
     * checks if the slider is active or they are not enough videos
     */
    shouldShowSlider(cat: string): boolean {
        const videos = this.videosByCategory[cat];
        const minVideos = this.getMinVideosForCurrentScreen();
        return videos && videos.length >= minVideos;
    }

    /**
     * reinitalizes the sliders and the lastslideObservers
     */
    reinitializeSliders() {
        this.lastSlideObservers.forEach(observer => observer.disconnect());
        this.lastSlideObservers = [];
        this.sliders.forEach((slider, index) => {
            const category = this.categories.filter(cat => this.shouldShowSlider(cat))[index];
            if (slider) {
                this.sliderPositions[category] = slider.track.details.rel;
                slider.destroy();
            }
        });
        this.sliders = [];
        this.categorySliders = {};
        setTimeout(() => this.initializeSliders(), 200);
    }

    /**
     * initialize the keensliders for each category
     */
    initializeSliders() {
        if (!this.sliderRefs) return;
        const sliderCategories = this.categories.filter(cat => this.shouldShowSlider(cat));
        this.sliderRefs.forEach((sliderRef, index) => {
            try {
                const category = sliderCategories[index];
                this.createSlider(sliderRef, category);
            } catch (error) {
                console.error(this.translate.instant('error.iniSlider') + `${index}:`, error);
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
     */
    observeLastSlide(sliderElement: HTMLElement) {
        const slides = sliderElement.querySelectorAll('.keen-slider__slide');
        const lastSlide = slides[slides.length - 2];
        if (!lastSlide) return;
        const observer = new IntersectionObserver(async (entries, obs) => {
            const entry = entries[0];
            if (!entry.isIntersecting || !this.nextPage) return;
            obs.disconnect();
            if (this.token) {
                await this.getVideos(this.token);
                setTimeout(() => this.reinitializeSliders(), 150);
            }
        }, { threshold: 0.8, rootMargin: '50px' });
        observer.observe(lastSlide);
        this.lastSlideObservers.push(observer);
    }

    /**
     * calculates the percentage of the video that was watched by the user
     * 
     * @param video the video
     * @returns percentage watched from 1 to 100
     */
    getWatchedPercentage(video: Video): number {
        if (!video.watched_until || !video.duration) return 0;
        return Math.min((video.watched_until / video.duration) * 100, 100);
    }
}