import { Component } from '@angular/core';


@Component({
  selector: 'app-feedback-overlay',
  imports: [],
  templateUrl: './feedback-overlay.component.html',
  styleUrl: './feedback-overlay.component.scss'
})
export class FeedbackOverlayComponent {
  feedbackText: string | null = null;
  isActive: boolean = true;

  /**
  * Displays the feedback message and animates it into view immediately.
  * @param message - The feedback message to show.
  */
  showFeedback(message: string): void {
    this.feedbackText = "keks";
    setTimeout(() => {
      this.isActive = true;
    }, 200);
    this.isActive = false;
    setTimeout(() => {
      this.feedbackText = null;
    }, 1500);
  }



}