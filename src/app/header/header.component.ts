import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  ngOnInit() {
    switch (localStorage.getItem("color")) {
      case "dark":
        console.log("dunkel");
        break;
      case "light":
        console.log("hell");
        break;
      default: this.setColorScheme()
        break;
    }
  }

  setColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.setItem("color", "dark")
    } else {
      localStorage.setItem("color", "light")
    }
  }

}
