import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /main if token exists and currentUrl is not allowed', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'auth') return 'testToken';
      return null;
    });
    let routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(1, '/login', '/login')), url: '/login'
    });
    new HeaderComponent({ setTranslation: () => { }, setDefaultLang: () => { } } as any, routerSpy);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('should initialize english language and darkmode', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'lang') return 'en';
      if (key === 'color') return 'dark';
      return null;
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentLang).toBe('en');
    expect(component.darkmode).toBeTrue();
  });

  it('should initialize german language and lightmode', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'lang') return 'de';
      if (key === 'color') return 'light';
      return null;
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentLang).toBe('de');
    expect(component.darkmode).toBeFalse();
  });

  it('should initialize german if no language is set', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentLang).toBe('de');
  });

  it('should initialize light mode according to prefers-color-scheme', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(window, 'matchMedia').and.callFake(() => ({ matches: false }) as MediaQueryList);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges()
    expect(component.darkmode).toBeFalse();
  });

  it('should initialize dark mode according to prefers-color-scheme', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      return { matches: query === '(prefers-color-scheme: dark)' } as MediaQueryList;
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges()
    expect(component.darkmode).toBeTrue();
  });

  it('should toggle the language box', () => {
    expect(fixture.debugElement.query(By.css('nav'))).toBeFalsy();
    expect(component.selectLang).toBeFalse();
    component.toggleLangBox();
    fixture.detectChanges()
    expect(component.selectLang).toBeTrue();
    expect(fixture.debugElement.query(By.css('nav'))).toBeTruthy();
  });

  it('should switch language', () => {
    component.changeLang('en');
    expect(component.currentLang).toBe('en');
  });

  it('should switch color scheme', () => {
    component.darkmode = true;
    component.switchColorScheme();
    expect(component.darkmode).toBeFalse();
  });

  it('should show login button when no token', () => {
    component.token = null;
    fixture.detectChanges();
    let loginButton = fixture.debugElement.query(By.css('.button'));
    let buttonText = loginButton.nativeElement.textContent;
    expect(['Anmelden', 'Login']).toContain(buttonText);
  });

  it('should show logout button when token exists', () => {
    component.token = 'abc';
    fixture.detectChanges();
    let logoutIcon = fixture.debugElement.query(By.css('.logout-svg'));
    expect(logoutIcon).toBeTruthy();
  });

  it('should logout and remove token', () => {
    spyOn(localStorage, 'removeItem');
    component.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(component.currentUrl).toBe('');
  });

  it('should display back button on /legal and /privacy', () => {
    component.currentUrl = '/privacy';
    fixture.detectChanges();
    let backButton = fixture.debugElement.query(By.css('svg.back'));
    expect(backButton).toBeTruthy();
  });

  it('should not show login/logout on /login route', () => {
    component.currentUrl = '/login';
    component.token = null;
    fixture.detectChanges();
    let button = fixture.debugElement.query(By.css('.button'));
    expect(button).toBeNull();
  });
});
