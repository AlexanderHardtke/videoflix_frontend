import { Injectable } from '@angular/core';
import { Video } from './video.model';

@Injectable({ providedIn: 'root' })
export class VideoTransferService {
  private video: Video | null = null;

  setVideo(video: Video) {
    this.video = video;
  }

  getVideo(): Video | null {
    return this.video;
  }
}
