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
  darkmode = true;
  public currentLang = 'de';
  selectLang = false;
  currentUrl = '';
  token: string | null = null;

  constructor(private translate: TranslateService, private router: Router) {
    this.setTranslation();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        this.checkAuthentication();
      });
  }

  /**
   * checks authentication and darkmode
   */
  ngOnInit() {
    this.checkDarkmode();
  }

  /**
   * gets the token from the local storage or sets it to null
   */
  checkAuthentication() {
    let auth = localStorage.getItem('auth');
    if (auth) {
      this.token = auth;
      const currentUrl = this.router.url;
      const allowedRoutes = ['/video', '/legal', '/privacy', '/info'];
      if (!allowedRoutes.some(route => currentUrl.startsWith(route))) {
        this.router.navigate(['/main']);
      }
    } else this.token = null;
  }

  /**
   * closes the language selector box if the user clicks outside
   * 
   * @param target the language selector box
   */
  @HostListener('document:mouseup', ['$event.target'])
  onClickOutsideLanBox(target: HTMLElement): void {
    if (this.selectLang) {
      let clickInsideBox = this.langBox.nativeElement.contains(target) || this.toggleBox.nativeElement.contains(target); {
      } if (!clickInsideBox) this.selectLang = false;
    }
  }

  /**
   * changes the language to the selected language from the user
   * 
   * @param lang the language code
   */
  public changeLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang === 'en' ? 'en' : 'de';
    localStorage.setItem('lang', this.currentLang);
  }

  /**
   * checks the localstorage for dark mode and displays the colors needed
   * if local storage is empty sets the color scheme
   */
  checkDarkmode() {
    switch (localStorage.getItem('color')) {
      case 'dark':
        this.setDarkMode();
        break;
      case 'light':
        this.setLightMode();
        break;
      default: this.setColorScheme()
        break;
    }
  }

  /**
   * checks the prefered color scheme of the user and sets it into the local storage
   */
  setColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setDarkMode();
    } else this.setLightMode();
  }

  /**
   * sets the colors to darkmode
   */
  setDarkMode() {
    this.darkmode = true;
    localStorage.setItem('color', 'dark')
    document.documentElement.classList.add('darkmode');
    document.documentElement.classList.remove('lightmode');
  }

  /**
   * sets the colors to lightmode
   */
  setLightMode() {
    this.darkmode = false;
    localStorage.setItem('color', 'light')
    document.documentElement.classList.add('lightmode');
    document.documentElement.classList.remove('darkmode');
  }

  /**
   * switches the color theme to either dark or light mode
   */
  switchColorScheme() {
    this.darkmode = !this.darkmode;
    if (this.darkmode) this.setDarkMode();
    else this.setLightMode();
  }

  /**
   * sets the Translation JSON and the local storage language setting
   */
  setTranslation() {
    this.translate.setTranslation('de', translateionsDE);
    this.translate.setTranslation('en', translateionsEN);
    if (localStorage.getItem('lang')) {
      let lang = localStorage.getItem('lang')
      if (lang) {
        this.currentLang = lang;
        this.translate.setDefaultLang(lang);
      }
    } else {
      this.translate.setDefaultLang('de');
      localStorage.setItem('lang', 'de');
    }
  }

  /**
   * toggles the language selector box
   */
  toggleLangBox() {
    this.selectLang = !this.selectLang;
  }

  /**
   * removes the token from the localstorage and navigates the user to the login-page
   */
  logout() {
    localStorage.removeItem('auth');
    this.router.navigate(['/login']);
  }
}
