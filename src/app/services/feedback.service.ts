import { Injectable } from '@angular/core';
import { FeedbackOverlayComponent } from '../feedback-overlay/feedback-overlay.component';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private overlayRef: FeedbackOverlayComponent | null = null;

  register(overlay: FeedbackOverlayComponent) {
    this.overlayRef = overlay;
  }

  showFeedback(message: string) {
    this.overlayRef?.showFeedback(message);
  }
}