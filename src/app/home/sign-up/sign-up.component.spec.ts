import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RegistrationService } from '../../services/registration.service';
import { FeedbackService } from '../../services/feedback.service';
import { Router } from '@angular/router';
import { SVG_PATHS } from '../../assets/img/svg-paths';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ],
      imports: [
        SignUpComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get email from service and clear it on init', () => {
    const testEmail = 'test@example.com';
    const regService = TestBed.inject(RegistrationService);
    spyOn(regService, 'getEmail').and.returnValue(testEmail);
    spyOn(regService, 'clear');
    component.ngOnInit();
    expect(component.form.email).toBe(testEmail);
    expect(regService.clear).toHaveBeenCalled();
  });

  it('should set isLoading true when registering and send correct data', () => {
    const http = TestBed.inject(HttpClient);
    spyOn(http, 'post').and.returnValue({ subscribe: ({ next }: any) => next({ message: 'Erfolg' }) } as any);
    const feedback = TestBed.inject(FeedbackService);
    spyOn(feedback, 'showFeedback');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.form.email = 'user@test.de';
    component.form.password = 'pw1234';
    component.form.repeated_password = 'pw1234';
    component.registerUser();
    expect(component.isLoading).toBe(false);
    expect(feedback.showFeedback).toHaveBeenCalledWith('Erfolg');
    expect(router.navigate).toHaveBeenCalledWith(['/check']);
  });

  it('should show error on registration failure', () => {
    const http = TestBed.inject(HttpClient);
    spyOn(http, 'post').and.returnValue({ subscribe: ({ error }: any) => error({ error: { error: 'Fehler' } }) } as any);
    const feedback = TestBed.inject(FeedbackService);
    spyOn(feedback, 'showError');
    component.registerUser();
    expect(component.isLoading).toBe(false);
    expect(feedback.showError).toHaveBeenCalledWith('Fehler');
  });

  it('should show password and set SVG path', () => {
    const svg = document.createElement('div');
    svg.innerHTML = '<svg><path></path></svg>';
    component.showPassword(svg, 'pw');
    expect(component.passwordType).toBe('text');
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(SVG_PATHS.visible);
  });

  it('should hide password and reset SVG path', () => {
    const svg = document.createElement('div');
    svg.innerHTML = '<svg><path></path></svg>';
    component.hidePassword(svg, 'pw');
    expect(component.passwordType).toBe('password');
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(SVG_PATHS.invisible);
  });

  it('should mark input as untouched', () => {
    const mockNgModel = {
      control: {
        markAsUntouched: jasmine.createSpy()
      }
    } as any;
    component.markAsUntouched(mockNgModel);
    expect(mockNgModel.control.markAsUntouched).toHaveBeenCalled();
  });
});
