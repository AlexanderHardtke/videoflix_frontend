import { Injectable } from '@angular/core';
import { Video } from './video.model';

@Injectable({ providedIn: 'root' })
export class VideoTransferService {
  private video: Video | null = null;

  /**
   * sets the Video for the info page
   * 
   * @param video the selected video
   */
  setVideo(video: Video) {
    this.video = video;
  }

  /**
   * gets the Video for the info page
   * 
   * @returns the selected video
   */
  getVideo(): Video | null {
    return this.video;
  }
}
