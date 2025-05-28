import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import translateionsDE from '../../../public/i18n/de.json';
import translateionsEN from '../../../public/i18n/en.json';
import { NgStyle } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, NgStyle, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('langBox') langBox!: ElementRef<HTMLDivElement>;
  @ViewChild('toggleBox') toggleBox!: ElementRef<HTMLDivElement>;
  darkmode: boolean = true;
  public currentLang = 'de';
  selectLang: boolean = false;
  currentUrl: string = '';

  constructor(private translate: TranslateService, private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });
    this.setTranslation();
  }

  @HostListener('document:mouseup', ['$event.target'])
  onClickOutsideLanBox(target: HTMLElement): void {
    if (this.selectLang) {
      let clickInsideBox = this.langBox.nativeElement.contains(target) || this.toggleBox.nativeElement.contains(target); {
      } if (!clickInsideBox) this.selectLang = false;
    }
  }

  public changeLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang === 'en' ? 'en' : 'de';
    localStorage.setItem("lang", this.currentLang);
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

  setTranslation() {
    this.translate.setTranslation('de', translateionsDE);
    this.translate.setTranslation('en', translateionsEN);
    if (localStorage.getItem("lang")) {
      let lang = localStorage.getItem("lang")
      if (lang) {
        this.currentLang = lang;
        this.translate.setDefaultLang(lang);
      }
    } else {
      this.translate.setDefaultLang('de');
      localStorage.setItem("lang", 'de');
    }
  }

  toggleLang() {
    this.selectLang = !this.selectLang;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
