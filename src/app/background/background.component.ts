import { Component, OnInit } from '@angular/core';
import { BackgroundService } from '../services/background.service';


@Component({
  selector: 'app-background',
  imports: [],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class BackgroundComponent implements OnInit {
  background = '../assets/img/background.jpg';

  constructor(private backgroundService: BackgroundService) { }

  ngOnInit() {
    this.backgroundService.background$.subscribe(url => {
      this.background = url;
    });
  }

}
