import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FeedbackService } from '../services/feedback.service';


@Component({
  selector: 'app-feedback-overlay',
  imports: [NgClass],
  templateUrl: './feedback-overlay.component.html',
  styleUrl: './feedback-overlay.component.scss'
})
export class FeedbackOverlayComponent {
  feedbackText: string | null = null;
  isActive = false;

  constructor(private feedback: FeedbackService) { }

  /**
   * registers the Feedbackservice for this module
   */
  ngOnInit() {
    this.feedback.register(this);
  }

  /**
  * Displays the feedback message and animates it into view.
  * @param message - The feedback message to show.
  */
  showFeedback(message: string) {
    this.feedbackText = message;
    setTimeout(() => {
      this.isActive = true;
    }, 50);
  }

  /**
   * Closes the feedback message and animates it out of view.
   */
  closeFeedback() {
    this.isActive = false;
    setTimeout(() => {
      this.feedbackText = null;
    }, 500);
  }

}