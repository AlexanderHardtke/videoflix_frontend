import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import translateionsDE from '../../../public/i18n/de.json';
import translateionsEN from '../../../public/i18n/en.json';
import { NgStyle, NgClass } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RegistrationService } from '../services/registration.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { env } from '../../environments/environment';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, NgStyle, NgClass, RouterLink],
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
  auth: boolean | null = null;
  isLoading = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private registration: RegistrationService,
    private http: HttpClient,
    private feedback: FeedbackService
  ) {
    this.setTranslation();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        this.checkAuthentication();
      });
  }

  /**
   * checks darkmode
   */
  ngOnInit() {
    this.checkDarkmode();
  }

  /**
   * gets the confirmation for authentication from the registration service or sets it to null
   */
  checkAuthentication() {
    this.auth = this.registration.auth;
    if (this.auth) {
      const currentUrl = this.router.url;
      const allowedRoutes = ['/video', '/legal', '/privacy', '/info'];
      if (!allowedRoutes.some(route => currentUrl.startsWith(route))) {
        this.router.navigate(['/main']);
      }
    } else this.auth = null;
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
   * removes the cookie from the backend to be set to 0 and navigates the user to the login-page
   */
  logout() {
    if (this.isLoading) return;
    this.isLoading = true;
    const lang = localStorage.getItem('lang') || 'en';
    const headers = new HttpHeaders().set('Accept-Language', lang);
    this.http.post(env.url + 'api/logout/', { headers, withCredentials: true }).subscribe({
      next: (response: any) => this.successLogout(response),
      error: (err) => {
        this.feedback.showError(err.error.error);
        this.isLoading = false;
      }
    });
  }

  /**
   * successfully logs out the user and moves him to the start-page
   * 
   * @param response the message from the backend
   */
  successLogout(response: any) {
    this.registration.auth = false;
    this.router.navigate(['/login']);
    const msg = response.message || 'Erfolgreich abgemeldet';
    this.feedback.showFeedback(msg)
    this.isLoading = false;
  }
}