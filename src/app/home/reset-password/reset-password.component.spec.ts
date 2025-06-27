import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { FeedbackService } from '../../services/feedback.service';
import { SVG_PATHS } from '../../assets/img/svg-paths';
import { env } from '../../../environments/environment';
import { of, throwError } from 'rxjs';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let feedback: jasmine.SpyObj<FeedbackService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: FeedbackService,
          useValue: jasmine.createSpyObj('FeedbackService', ['showFeedback', 'showError'])
        }
      ],
      imports: [
        ResetPasswordComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    feedback = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send reset password request and handle success', fakeAsync(() => {
    const mockActivatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(mockActivatedRoute.snapshot.paramMap, 'get').and.returnValue('mock-token');
    const http = TestBed.inject(HttpClient);
    const mockResponse = { message: 'Passwort erfolgreich geändert' };
    spyOn(http, 'post').and.returnValue(of(mockResponse));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.resetPassword();
    expect(feedback.showFeedback).toHaveBeenCalledWith('Passwort erfolgreich geändert');
    tick(1500);
    expect(router.navigate).toHaveBeenCalledWith(['']);
  }));

  it('should call showError on error', () => {
    const mockActivatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(mockActivatedRoute.snapshot.paramMap, 'get').and.returnValue('mock-token');
    spyOn(localStorage, 'getItem').and.returnValue('en');
    const http = TestBed.inject(HttpClient);
    const mockError = { error: { error: 'Token ungültig' } };
    spyOn(http, 'post').and.returnValue(throwError(mockError));
    component.resetPassword();
    expect(feedback.showError).toHaveBeenCalledWith('Token ungültig');
  });

  it('should mark field as untouched', () => {
    const mockModel = {
      control: {
        markAsUntouched: jasmine.createSpy(), root: {}
      }
    } as any;
    component.markAsUntouched(mockModel);
    expect(mockModel.control.markAsUntouched).toHaveBeenCalled();
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
});
