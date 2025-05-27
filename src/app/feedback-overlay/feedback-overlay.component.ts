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
  visible = false;

  constructor(private feedback: FeedbackService) { }

  /**
   * registers the Feedbackservice for this module
   */
  ngOnInit() {
    this.feedback.register(this);
  }

  /**
   * Checks if a feedback message is already open and closes it before openeing the next one
   * 
   * @param message the message from the backend
   */
  checkFeedback(message: string) {
    if (this.visible) {
      this.closeFeedback();
      setTimeout(() => {
        this.showFeedback(message);
      }, 251);
    } else this.showFeedback(message);
  }

  /**
  * Displays the feedback message and animates it into view.
  * @param message - The feedback message to show.
  */
  showFeedback(message: string) {
    this.feedbackText = message;
    this.visible = true;
    setTimeout(() => {
      this.isActive = true;
    }, 30);
  }

  /**
   * Closes the feedback message and animates it out of view.
   */
  closeFeedback() {
    this.isActive = false;
    this.visible = false;
    setTimeout(() => {
      this.feedbackText = null;
    }, 250);
  }

}