import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  darkmode: boolean = true;

  ngOnInit() {
    switch (localStorage.getItem("color")) {
      case "dark":
        this.setDarkMode();
        break;
      case "light":
        this.setLightMode();
        break;
      default: this.setColorScheme()
        break;
    }
  }

  setColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.setItem("color", "dark")
      this.setDarkMode();
    } else {
      localStorage.setItem("color", "light")
      this.setLightMode();
    }
  }

  setDarkMode() {
    document.documentElement.classList.add('darkmode');
    document.documentElement.classList.remove('lightmode');
  }

  setLightMode() {
    document.documentElement.classList.add('lightmode');
    document.documentElement.classList.remove('darkmode');
  }

  switchColorScheme() {
    this.darkmode = !this.darkmode;
    if (this.darkmode) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

}
