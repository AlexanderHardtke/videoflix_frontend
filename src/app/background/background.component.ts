import { Component, OnInit } from '@angular/core';
import { BackgroundService } from '../services/background.service';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-background',
  imports: [NgClass],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class BackgroundComponent implements OnInit {
  background = '../assets/img/background.jpg';
  fixed = true;

  constructor(private backgroundService: BackgroundService) { }

  /**
   * loads the image from the backgroundservice into the background and fixed the image if it is not a custom image
   */
  ngOnInit() {
    this.backgroundService.background$.subscribe(img => {
      this.background = img;
      if (img.includes('/assets/img/background')) this.fixed = true;
      else this.fixed = false;
    });
  }

}
