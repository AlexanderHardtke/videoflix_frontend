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
        const urls = this.video.video_urls;
        if (net === '4g' && urls['1080p']) this.videoUrl = urls['1080p'];
        else if (net === '3g' && urls['720p']) this.videoUrl = urls['720p'];
        else if (net === '2g' && urls['360p']) this.videoUrl = urls['360p'];
        else this.videoUrl = urls['240p'] || urls['360p'] || urls['720p'] || urls['1080p'];
    }

    /**
     * loads the video in the video-player or shows an error message
     */
    loadVideo() {
        if (this.videoUrl && this.videoElement) {
            if (this.player) this.player.dispose();
            this.player = videojs(this.videoElement.nativeElement, this.getPlayerOptions());
            this.player.ready(() => {
                this.player!.hotkeys({
                    volumeStep: 0.1, seekStep: 10, enableModifiersForNumbers: false
                });
                this.customizeFullscreenButton();
            });
        } else if (!this.videoUrl) this.feedback.showError('Keine gültige Video-URL gefunden');
    }

    /**
     * gets the player options for the videojs player
     * 
     * @returns the configuration of the player
     */
    getPlayerOptions() {
        return {
            sources: [{ src: this.videoUrl, type: 'video/mp4' }], controls: true, fluid: true,
            playbackRates: [0.5, 1, 1.5, 2], preload: 'auto', autoplay: true, responsive: true,
            controlBar: {
                skipButtons: { forward: 10, backward: 10 },
                children: [
                    'playToggle', 'skipBackward', 'skipForward', 'volumePanel',
                    'progressControl', 'playbackRateMenuButton', 'fullscreenToggle'
                ]
            },
        };
    }

    /**
     * changes the orientation of the device on mopbile after entering fullscreen
     * and sets it back after leaving it
     * 
     * @returns
     */
    customizeFullscreenButton() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const fsToggle = (this.player as any).controlBar.fullscreenToggle;
        if (!fsToggle) return;
        fsToggle.handleClick = async () => {
            if (!this.player.isFullscreen()) {
                await this.player.requestFullscreen();
                if (isMobile) this.lockLandscape();
            } else {
                await this.player.exitFullscreen();
                if (isMobile && screen.orientation) screen.orientation.unlock();
            }
        };
        this.checkFullscreenChange(isMobile)
    }

    /**
     * locks the device in landscape mode
     */
    lockLandscape() {
        if ('orientation' in screen && 'lock' in screen.orientation) {
            setTimeout(async () => {
                try {
                    await (screen.orientation as any).lock('landscape');
                } catch (err: any) {
                    console.warn('Orientation lock failed:', err.name, err.message);
                }
            }, 100);
        }
    }

    /**
     * checks if the fullscreen is chnaged off and removes the screenlock
     * 
     * @param isMobile 
     */
    checkFullscreenChange(isMobile: boolean) {
        this.player.on('fullscreenchange', () => {
            if (!this.player.isFullscreen() && isMobile && screen.orientation) {
                setTimeout(() => screen.orientation.unlock(), 100);
            }
        });
    }

    /**
     * starts the video after the component is fully loaded
     */
    ngAfterViewInit() {
        this.resetTimeout();
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
