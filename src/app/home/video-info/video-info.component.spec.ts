import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInfoComponent } from './video-info.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { VideoTransferService } from '../../services/video-transfer.service';
import { FeedbackService } from '../../services/feedback.service';

describe('VideoInfoComponent', () => {
  let component: VideoInfoComponent;
  let fixture: ComponentFixture<VideoInfoComponent>;
  let mockRouter: any;
  let mockFeedback: any;
  let mockTranslate: any;
  let mockVideoTrans: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockFeedback = jasmine.createSpyObj('FeedbackService', ['showError']);
    mockTranslate = {
      currentLang: '',
      defaultLang: '',
      instant: () => ''
    };
    mockVideoTrans = jasmine.createSpyObj(['getVideo']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: VideoTransferService, useValue: mockVideoTrans },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: Router, useValue: jasmine.createSpyObj(['navigate']) },
        { provide: FeedbackService, useValue: jasmine.createSpyObj(['showError']) },
      ],
      imports: [
        VideoInfoComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VideoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set video if token and video found', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    const mockVideo = { name: 'Test Video' } as any;
    mockVideoTrans.getVideo.and.returnValue(mockVideo);
    component.ngOnInit();
    expect(component.video).toEqual(mockVideo);
  });

  it('should return German description', () => {
    const video = { description_de: 'German', description_en: 'English' } as any;
    mockTranslate.currentLang = 'de';
    expect(component.getDescriptionLang(video)).toBe('German');
  });

  it('should return English description', () => {
    const video = { description_de: 'German', description_en: 'English' } as any;
    mockTranslate.currentLang = 'en';
    expect(component.getDescriptionLang(video)).toBe('English');
  });

  it('should update screen width and do nothing if smaller', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    component.updateScreenWidth();
    expect(component.currScreenWidth).toBe(500);
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/main']);
  });

  it('should call updateScreenWidth on resize', () => {
    const spy = spyOn(component, 'updateScreenWidth');
    component.onResize(new Event('resize'));
    expect(spy).toHaveBeenCalled();
  });
});
