import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MainPageComponent } from './main-page.component';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeedbackService } from '../../services/feedback.service';
import { BackgroundService } from '../../services/background.service';
import { Router } from '@angular/router';
import { VideoTransferService } from '../../services/video-transfer.service';
import { Video } from '../../services/video.model';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let mockFeedback: any;
  let mockBackground: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockFeedback = jasmine.createSpyObj(['showError']);
    mockBackground = jasmine.createSpyObj(['setDynamicBackground']);
    mockRouter = jasmine.createSpyObj(['navigate']);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: FeedbackService, useValue: mockFeedback },
        { provide: BackgroundService, useValue: mockBackground },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: { instant: () => '' } },
        { provide: VideoTransferService, useValue: {} },
      ],
      imports: [
        MainPageComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();
    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to start-page if no token is present', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(TestBed.inject(FeedbackService).showError).toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['']);
  });

  it('should call getVideos and updateScreenWidth if token is present', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    let spy = spyOn(component, 'getVideos').and.stub();
    let updateSpy = spyOn(component, 'updateScreenWidth').and.stub();
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith('token');
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should call slider.prev or slider.next', () => {
    let sliderMock = jasmine.createSpyObj('slider', ['prev', 'next']);
    component.categorySliders['trailer'] = sliderMock;
    component.navigateVideos('trailer', 'left');
    expect(sliderMock.prev).toHaveBeenCalled();
    component.navigateVideos('trailer', 'right');
    expect(sliderMock.next).toHaveBeenCalled();
  });

  it('should set atfVideo and update background for desktop', () => {
    let mockVideo = { big_image: 'test.jpg' } as Video;
    component.videosByCategory['new'].push(mockVideo);
    component.isMobile = false;
    component.getNewestVideo();
    expect(component.atfVideo).toEqual(mockVideo);
    expect(mockBackground.setDynamicBackground).toHaveBeenCalledWith('test.jpg');
  });

  it('should set background to empty string for mobile', () => {
    const mockVideo = { big_image: 'test.jpg' } as Video;
    component.videosByCategory['new'].push(mockVideo);
    component.isMobile = true;
    component.getNewestVideo();
    expect(mockBackground.setDynamicBackground).toHaveBeenCalledWith('');
  });

  it('should return true if category is valid', () => {
    expect(component.isValidCategory('new')).toBeTrue();
  });

  it('should return false if category is invalid', () => {
    expect(component.isValidCategory('unknown')).toBeFalse();
  });

  it('should reset all categories to empty arrays', () => {
    component.videosByCategory['new'].push({} as Video);
    component.videosByCategory['animals'].push({} as Video);
    component.resetCategories();
    expect(component.videosByCategory).toEqual({
      new: [],
      animals: [],
      nature: [],
      training: [],
      tutorials: []
    });
  });

  it('should show error, remove token and navigate home', () => {
    spyOn(localStorage, 'removeItem');
    component.errorMessage(new HttpErrorResponse({ error: { error: 'Test Error' } }));
    expect(mockFeedback.showError).toHaveBeenCalledWith('Test Error');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should use fallback error message if no error provided', () => {
    spyOn(localStorage, 'removeItem');
    component.errorMessage(new HttpErrorResponse({}));
    expect(mockFeedback.showError).toHaveBeenCalledWith('Fehler beim laden der Videos');
  });

  it('should play preview video and hide image', async () => {
    let video = document.createElement('video');
    let img = document.createElement('img');
    video.dataset['src'] = 'video.mp4';
    let container = document.createElement('div');
    container.appendChild(video);
    container.appendChild(img);
    await component.playPreview({ currentTarget: container } as unknown as MouseEvent);
    expect(video.src).toContain('video.mp4');
    expect(img.classList.contains('hide')).toBeTrue();
    expect(video.classList.contains('hide')).toBeFalse();
  });

  it('should stop preview video and show image', () => {
    let video = document.createElement('video');
    let img = document.createElement('img');
    let container = document.createElement('div');
    container.appendChild(video);
    container.appendChild(img);
    video.src = 'video.mp4';
    video.currentTime = 10;
    component.stopPreview({ currentTarget: container } as unknown as MouseEvent);
    expect(video.src).toBe('');
    expect(video.currentTime).toBe(0);
    expect(video.classList.contains('hide')).toBeTrue();
    expect(img.classList.contains('hide')).toBeFalse();
  });

  it('should navigate to video page with correct query param', () => {
    component.playVideo('my-video-url');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/video'], {
      queryParams: { url: 'my-video-url' }
    });
  });

  it('should set atfVideo and update background on desktop', () => {
    let mockVideo = { big_image: 'image.jpg' } as Video;
    component.isMobile = false;
    component.putVideoAtf(mockVideo);
    expect(component.atfVideo).toEqual(mockVideo);
    expect(mockBackground.setDynamicBackground).toHaveBeenCalledWith('image.jpg');
  });

  it('should update screen width and reinitialize sliders on resize', () => {
    spyOn(component, 'updateScreenWidth');
    spyOn(component, 'reinitializeSliders');
    component.onResize(new Event('resize'));
    expect(component.updateScreenWidth).toHaveBeenCalled();
    expect(component.reinitializeSliders).toHaveBeenCalled();
  });

  it('should set isMobile true and clear background on small screen', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    component.updateScreenWidth();
    expect(component.isMobile).toBeTrue();
    expect(mockBackground.setDynamicBackground).toHaveBeenCalledWith('');
  });

  it('should set isMobile false and set background if atfVideo exists', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1920);
    component.atfVideo = { big_image: 'image.jpg' } as Video;
    component.updateScreenWidth();
    expect(component.isMobile).toBeFalse();
    expect(mockBackground.setDynamicBackground).toHaveBeenCalledWith('image.jpg');
  });

  it('should match minVideos for a breakpoint', () => {
    (globalThis as any).minVidForRes = [{ maxWidth: 800, minVideos: 3 }];
    component.currScreenWidth = 700;
    expect(component.getMinVideosForCurrentScreen()).toBe(3);
  });

  it('should return true if enough videos for slider', () => {
    component.currScreenWidth = 500;
    spyOn(component, 'getMinVideosForCurrentScreen').and.returnValue(1);
    component.videosByCategory['new'] = [{} as Video];
    expect(component.shouldShowSlider('new')).toBeTrue();
  });

  it('should return false if not enough videos', () => {
    component.currScreenWidth = 500;
    spyOn(component, 'getMinVideosForCurrentScreen').and.returnValue(5);
    component.videosByCategory['new'] = [{}, {}] as Video[];
    expect(component.shouldShowSlider('new')).toBeFalse();
  });

  it('should disconnect observers, destroy sliders and reinitialize', fakeAsync(() => {
    let mockObserver = { disconnect: jasmine.createSpy() };
    component.lastSlideObservers = [mockObserver as any];
    component.sliders = [{ destroy: jasmine.createSpy(), track: { details: { rel: 1 } } }] as any;
    component.categories = ['new'];
    spyOn(component, 'shouldShowSlider').and.returnValue(true);
    spyOn(component, 'initializeSliders');
    component.reinitializeSliders();
    tick(200);
    expect(mockObserver.disconnect).toHaveBeenCalled();
    expect(component.sliders.length).toBe(0);
    expect(component.lastSlideObservers.length).toBe(0);
    expect(component.initializeSliders).toHaveBeenCalled();
  }));

  it('should calculate watched percentage correctly', () => {
    let video = { watched_until: 30, duration: 60 } as Video;
    expect(component.getWatchedPercentage(video)).toBe(50);
  });

  it('should return 0 if watched_until or duration is missing', () => {
    let video = { watched_until: 0 } as Video;
    expect(component.getWatchedPercentage(video)).toBe(0);
  });
});
