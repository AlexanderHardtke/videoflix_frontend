import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import translateionsDE from '../../../public/i18n/de.json';
import translateionsEN from '../../../public/i18n/en.json';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
  darkmode: boolean = true;
  public currentLang = 'DE';

  constructor(private translate: TranslateService) {
    this.translate.setTranslation('en', translateionsDE);
    this.translate.setTranslation('de', translateionsEN);
    this.translate.setDefaultLang('de');
  }

  public changeLang(lang: string) {
    this.translate
  }

  ngOnInit() {
    switch (localStorage.getItem("color")) {
      case "dark":
        this.setDarkMode();
        break;
      case "light":
        this.setLightMode();
        this.darkmode = false;
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
      localStorage.setItem("color", "dark")
    } else {
      this.setLightMode();
      localStorage.setItem("color", "light")
    }
  }
  
}
