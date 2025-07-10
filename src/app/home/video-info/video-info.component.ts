import { Component, HostListener } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Video } from '../../services/video.model';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VideoTransferService } from '../../services/video-transfer.service';
import { RegistrationService } from '../../services/registration.service';


@Component({
  selector: 'app-video-info',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './video-info.component.html',
  styleUrl: './video-info.component.scss'
})
export class VideoInfoComponent {
  video!: Video | null;
  currScreenWidth = 0;

  constructor(
    private router: Router,
    private feedback: FeedbackService,
    private translate: TranslateService,
    private videoTrans: VideoTransferService,
    private registration: RegistrationService
  ) { }

  /**
   * checks for a authentication in the registration service and either rejects the user or gets the videos
   */
  ngOnInit() {
    const auth = this.registration.auth;
    if (!auth) {
      this.feedback.showError(this.translate.instant('error.noToken'));
      this.router.navigate(['']);
    } else if (this.videoTrans.getVideo()) this.video = this.videoTrans.getVideo();
    else this.router.navigate(['/main']);
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
  }

  /**
   * Aktualisiert die aktuelle Browsergröße, wenn mobile entfernt das Titelbild
   */
  updateScreenWidth() {
    this.currScreenWidth = window.innerWidth;
    if (this.currScreenWidth < 768) return
    else this.router.navigate(['/main']);
  }
}
