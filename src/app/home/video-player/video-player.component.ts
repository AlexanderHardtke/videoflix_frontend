import { Component, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';

@Component({
    selector: 'app-video-player',
    imports: [],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent {
    @ViewChild('videoRef') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('header') header!: ElementRef;
    @Input() videoSrc: string = '../assets/aurora_borealis.mp4'
    hidden: boolean = false;
    timer: any = null;
    margin = 75;

    constructor(private feedback: FeedbackService) {}

    /**
     * starts the video after the component si fully loaded
     */
    ngAfterViewInit() {
        this.resetTimeout();
        setTimeout(() => this.play(), 1000);
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
        if (this.timer) clearTimeout(this.timer);
    }

    /**
     * starts the video for the user
     */
    async play() {
        try {
            const video = this.videoElement.nativeElement;
            await video.play();
        } catch (error) {
            console.error('Playback failed:', error);
            this.feedback.showError('Playback failed:');
            this.videoElement.nativeElement.load();
            setTimeout(() => this.videoElement.nativeElement.play(), 500);
        }
    }
}
