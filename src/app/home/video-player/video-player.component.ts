import { Component, ViewChild, ElementRef, Input, HostListener } from '@angular/core';

@Component({
    selector: 'app-video-player',
    standalone: true,
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

    ngAfterViewInit() {
        this.resetTimeout();
        setTimeout(() => {
            this.play();
        }, 1000);
        
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const nearBorder = event.clientY < this.margin || window.innerHeight - event.clientY < this.margin;
        if ((nearBorder) && this.hidden) this.showHeader();
        else if (!nearBorder && !this.hidden) this.resetTimeout();
    }

    @HostListener('document:touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.showHeader();
    }

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

    hideHeader() {
        if (!this.hidden) {
            const header = this.header.nativeElement;
            header.style.transform = 'translateY(-100%)';
            header.style.opacity = '0';
            this.hidden = true;
        }
    }
    resetTimeout() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.hideHeader(), 3000);
    }

    ngOnDestroy() {
        if (this.timer) clearTimeout(this.timer);
    }

    async play() {
        try {
            const video = this.videoElement.nativeElement;
            await video.play();
        } catch (error) {
            console.error("Playback failed:", error);
            this.videoElement.nativeElement.load();
            setTimeout(() => this.videoElement.nativeElement.play(), 500);
        }
    }
}
