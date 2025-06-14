import { Component, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VideoDetail } from '../../services/video.model';
import Player from "video.js/dist/types/player";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import "videojs-hotkeys";


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
    player!: Player


    constructor(
        private router: Router,
        private feedback: FeedbackService,
        private route: ActivatedRoute,
        private http: HttpClient
    ) { }

    /**
     * checks the url and gets the videodetails, if the user tries to enter nothing, moves to the main page
     */
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

    /**
     * checks the authentication and gets the video-detail from the backend and loads the video
     * 
     * @param url the url from the http
     */
    getVideoDetails(url: string) {
        const token = localStorage.getItem('auth');
        if (token) {
            const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
            this.http.get<VideoDetail>(url, { headers }).subscribe({
                next: data => {
                    this.video = data;
                    if (this.video.name) this.videoTitle = this.video.name;
                    this.setVideoUrl();
                    this.loadVideo();
                }, error: (err) => this.failedVideo(err)
            });
        } else this.removeUserFromPage()
    }

    /**
     * removes the user from the page and brings him to the start page
     */
    removeUserFromPage() {
        this.feedback.showError('Kein Token gefunden, Zugriff verweigert');
        this.router.navigate(['']);
    }

    /**
     * shows the error message and brings the user to the start page
     * 
     * @param err 
     */
    failedVideo(err: any) {
        console.error('Failed to load video details:', err);
        this.feedback.showError(err.error.error);
        this.router.navigate(['/main']);
    }

    /**
     * checks the connection speed from the user and displays the appropiate video size
     */
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
    }

    /**
     * loads the video in the video-player or shows an error message
     */
    loadVideo() {
        if (this.videoUrl && this.videoElement) {
            if (this.player) this.player.dispose();
            this.player = videojs(this.videoElement.nativeElement, {
                sources: [{ src: this.videoUrl, type: 'video/mp4' }],
                controls: true,
                preload: 'auto',
                autoplay: true,
                responsive: true,
                fluid: true
            });
            this.player.ready(() => {
                this.player!.hotkeys({
                    volumeStep: 0.1,
                    seekStep: 5,
                    enableModifiersForNumbers: false
                });
            });
        } else if (!this.videoUrl) {
            this.feedback.showError('Keine gültige Video-URL gefunden');
        }
    }

    /**
     * starts the video after the component is fully loaded
     */
    ngAfterViewInit() {
        this.resetTimeout();
    }

    /**
     * toggles stop and play if the video is clicked
     * 
     * @returns if no video is loaded
     */
    togglePlay() {
        if (!this.player) return;
        if (this.player.paused()) {
            const space = new KeyboardEvent('keydown', { keyCode: 32 });
            document.dispatchEvent(space);
        } else {
            const space = new KeyboardEvent('keydown', { keyCode: 32 });
            document.dispatchEvent(space);
        }
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
        if (this.player) this.player.dispose();
        if (this.timer) clearTimeout(this.timer);
    }
}
