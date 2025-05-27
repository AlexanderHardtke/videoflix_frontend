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

  ngOnInit() {
    this.feedback.register(this);
  }

  /**
  * Displays the feedback message and animates it into view.
  * @param message - The feedback message to show.
  */
  showFeedback(message: string) {
    this.isActive = true;
    this.feedbackText = message;
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