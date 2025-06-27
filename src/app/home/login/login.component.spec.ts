import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let http: HttpClient;
  let feedbackSpy: jasmine.SpyObj<FeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    feedbackSpy = jasmine.createSpyObj('FeedbackService', ['showError', 'showFeedback']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ],
      imports: [
        LoginComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading and call successLogin on success', () => {
    spyOn(http, 'post').and.returnValue({
      subscribe: ({ next }: any) => next({ token: 'abc123', message: 'Erfolgreich angemeldet' })
    } as any);
    component.form.username = 'user';
    component.form.password = 'pass';
    component.loginUser();
    expect(component.isLoading).toBe(false);
    expect(localStorage.getItem('auth')).toBe('abc123');
    expect(component.form.username).toBe('');
    expect(component.form.password).toBe('');
  });

  it('should call showError on request error', () => {
    spyOn(http, 'post').and.returnValue({
      subscribe: ({ error }: any) => error({ error: { error: 'Login fehlgeschlagen' } })
    } as any);
    component.loginUser();
    expect(component.isLoading).toBe(false);
  });

  it('should do nothing if isLoading is true', () => {
    component.isLoading = true;
    spyOn(http, 'post');
    component.loginUser();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('should mark field as untouched', () => {
    let mockModel = {
      control: {
        markAsUntouched: jasmine.createSpy()
      }
    } as any;
    component.markAsUntouched(mockModel);
    expect(mockModel.control.markAsUntouched).toHaveBeenCalled();
  });

  it('should show and hide password with correct SVG', () => {
    let mockSvg = document.createElement('div');
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.appendChild(path);
    mockSvg.appendChild(svg);
    component.showPassword(mockSvg);
    expect(component.passwordType).toBe('text');
    expect(path.getAttribute('d')).toBeTruthy();
    component.hidePassword(mockSvg);
    expect(component.passwordType).toBe('password');
    expect(path.getAttribute('d')).toBeTruthy();
  });
});
