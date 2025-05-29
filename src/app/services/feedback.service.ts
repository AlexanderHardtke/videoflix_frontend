import { Injectable } from '@angular/core';
import { FeedbackOverlayComponent } from '../feedback-overlay/feedback-overlay.component';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private overlayRef: FeedbackOverlayComponent | null = null;

  /**
   * registers the overlaycomponent in this service
   * 
   * @param overlay the Overlay-component
   */
  register(overlay: FeedbackOverlayComponent) {
    this.overlayRef = overlay;
  }

  /**
   * takes the message from the api and gives it to the Overlay-component as feedback
   * 
   * @param message the feedback message from the api
   */
  showFeedback(message: string) {
    this.overlayRef?.showFeedback(message);
  }

  /**
   * takes the message from the api and gives it to the Overlay-component as error
   * 
   * @param message the error message from the api
   */
  showError(message: string) {
    this.overlayRef?.checkError(message);
  }
}


// Erstelle Morgen alle get und patch Funktionen zur API
// Erstelle Dokumentation
// Docker überarbeiten?
// UNIT Tests
//main.ts