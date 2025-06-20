import { Component } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Video } from '../../services/video.model';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VideoTransferService } from '../../services/video-transfer.service';


@Component({
  selector: 'app-video-info',
  imports: [TranslatePipe],
  templateUrl: './video-info.component.html',
  styleUrl: './video-info.component.scss'
})
export class VideoInfoComponent {
  video!: Video | null;

  constructor(
    private router: Router,
    private feedback: FeedbackService,
    private translate: TranslateService,
    private videoTrans: VideoTransferService
    ) { }

  /**
   * checks for a token and either rejects the user or gets the videos
   */
  ngOnInit() {
    const token = localStorage.getItem('auth');
    if (!token) {
      this.feedback.showError('Kein Token gefunden, Zugriff verweigert');
      this.router.navigate(['']);
    } else this.video = this.videoTrans.getVideo();
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

  public getVideoInfo(video: Video) {
    this.video = video;
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
}
