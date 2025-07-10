import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import "videojs-hotkeys";

const Button = videojs.getComponent('Button');

export class VideoQualityButton extends Button {
  constructor(player: Player, options: { children?: any[]; className?: string; } | undefined) {
    super(player, options);
    this.addClass('quality-button');
  }

  /**
   * handles the click on the button -> toggles the quality
   */
  handleClick() {
    this.player_.trigger('toggle-quality');
  }
}