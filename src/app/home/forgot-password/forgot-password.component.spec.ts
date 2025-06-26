import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FeedbackService } from '../../services/feedback.service';
import { Router } from '@angular/router';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  const feedbackSpy = jasmine.createSpyObj('FeedbackService', ['showError', 'showFeedback']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: FeedbackService, useValue: feedbackSpy },
        { provide: Router, useValue: routerSpy }
      ],
      imports: [
        ForgotPasswordComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading and call successMail on success', () => {
    const http = TestBed.inject(HttpClient);
    const feedback = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(http, 'post').and.returnValue({
      subscribe: ({ next }: any) => next({ message: 'Mail sent' })
    } as any);
    component.form.email = 'user@example.com';
    component.sendEmail();
    expect(component.isLoading).toBe(false);
    expect(feedback.showFeedback).toHaveBeenCalledWith('Mail sent');
    expect(router.navigate).toHaveBeenCalledWith(['/check']);
    expect(component.form.email).toBe('');
  });

  it('should call showError on request error', () => {
    const http = TestBed.inject(HttpClient);
    const feedback = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    spyOn(http, 'post').and.returnValue({
      subscribe: ({ error }: any) => error({ error: { error: 'Fehlermeldung' } })
    } as any);
    component.sendEmail();
    expect(feedback.showError).toHaveBeenCalledWith('Fehlermeldung');
    expect(component.isLoading).toBe(false);
  });

  it('should do nothing if isLoading is true', () => {
    component.isLoading = true;
    const http = TestBed.inject(HttpClient);
    spyOn(http, 'post');
    component.sendEmail();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('should mark field as untouched', () => {
    const mockModel = {
      control: {
        markAsUntouched: jasmine.createSpy()
      }
    } as any;
    component.markAsUntouched(mockModel);
    expect(mockModel.control.markAsUntouched).toHaveBeenCalled();
  });
});
