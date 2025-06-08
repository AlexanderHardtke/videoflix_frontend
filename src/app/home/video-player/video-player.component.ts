import { Component, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VideoDetail } from '../../services/video.model';


@Component({
    selector: 'app-video-player',
    imports: [RouterLink],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent {
    @ViewChild('videoRef') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('header') header!: ElementRef;
    @Input() videoUrl: string = ''
    hidden: boolean = false;
    timer: any = null;
    margin = 75;
    video!: VideoDetail;
    videoTitle: string = 'Lade Videoinformationen...';


    constructor(
        private router: Router,
        private feedback: FeedbackService,
        private route: ActivatedRoute,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            const url = params.get('url');
            if (url) {
                this.videoUrl = url;
                this.getVideoDetails(url);
            } else {
                this.feedback.showError('Keine Videodaten gefunden');
                this.router.navigate(['/main']);
            }
        });
    }

    getVideoDetails(url: string) {
        const token = localStorage.getItem('auth');
        if (!token) {
            this.feedback.showError('Kein Token gefunden, Zugriff verweigert');
            this.router.navigate(['']);
            return
        }
        const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
        this.http.get<VideoDetail>(url, { headers }).subscribe({
            next: data => {
                this.video = data;
                if (this.video.name) this.videoTitle = this.video.name;
                this.setVideoUrl();
                this.loadVideo();
            },
            error: (error) => {
                console.error('Failed to load video details:', error);
                this.feedback.showError(error.error.error);
                this.router.navigate(['/main']);
            }
        });
    }

    setVideoUrl() {
        const nav = navigator as any;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        const net = connection?.effectiveType || '4g';

        if (net === '4g' && this.video.file1080p) this.videoUrl = this.video.file1080p;
        else if (net === '3g' && this.video.file720p) this.videoUrl = this.video.file720p;
        else if (net === '2g' && this.video.file360p) this.videoUrl = this.video.file360p;
        else if (this.video.file240p) this.videoUrl = this.video.file240p;
        else {
            this.videoUrl = this.video.file1080p || this.video.file720p ||
                this.video.file360p || this.video.file240p;
        }
        console.log(`Network: ${net}, Selected video: ${this.videoUrl}`);
    }

    loadVideo() {
        if (this.videoUrl && this.videoElement) {
            const video = this.videoElement.nativeElement;
            video.src = this.videoUrl;

            // Event Listener für Video-Status
            video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded');
            });

            video.addEventListener('error', (e) => {
                console.error('Video loading error:', e);
                this.feedback.showError('Fehler beim Laden des Videos');
            });

            video.load(); // ✨ WICHTIG: Video neu laden
        } else if (!this.videoUrl) {
            this.feedback.showError('Keine gültige Video-URL gefunden');
        }
    }

    /**
     * starts the video after the component si fully loaded
     */
    ngAfterViewInit() {
        this.resetTimeout();
        setTimeout(() => this.play(), 1000);
        const video = this.videoElement.nativeElement;
        video.addEventListener('click', () => {
            if (video.paused) this.play();
            else video.pause();
        });
    }

    /**
     * checks if the user has moved the mouse up or down near the edge of the interface.
     * Then shows the interface to the user
     * 
     * @param event 
     */
    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const nearBorder = event.clientY < this.margin || window.innerHeight - event.clientY < this.margin;
        if ((nearBorder) && this.hidden) this.showHeader();
        else if (!nearBorder && !this.hidden) this.resetTimeout();
    }

    /**
     * checks if the user touched somewhere on the screen on mobile and activates the interface
     * 
     * @param event 
     */
    @HostListener('document:touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.showHeader();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') {
            event.preventDefault();
            const video = this.videoElement.nativeElement;
            if (video.paused) {
                this.play();
            } else {
                video.pause();
            }
        }
    }

    /**
     * shows the header interface for the video unless its already shown
     */
    showHeader() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.hidden) {
            const header = this.header.nativeElement;
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
            this.hidden = false;
        }
        this.resetTimeout();
    }

    /**
     * hides the header interface for the video
     */
    hideHeader() {
        if (!this.hidden) {
            const header = this.header.nativeElement;
            header.style.transform = 'translateY(-100%)';
            header.style.opacity = '0';
            this.hidden = true;
        }
    }

    /**
     * resets the timeout for hiding the interface
     */
    resetTimeout() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.hideHeader(), 2500);
    }

    /**
     * clears the timeout on leaving the component
     */
    ngOnDestroy() {
        if (this.timer) clearTimeout(this.timer);
    }

    /**
     * starts the video for the user
     */
    async play() {
        if (!this.video) return
        try {
            const video = this.videoElement.nativeElement;
            await video.play();
        } catch (error) {
            console.error('Playback failed:', error);
            this.feedback.showError('Wiedergabe fehlgeschlagen');
        }
    }
}
