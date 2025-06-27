import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { VideoPlayerComponent } from './video-player.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FeedbackService } from '../../services/feedback.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('VideoPlayerComponent', () => {
  let component: VideoPlayerComponent;
  let fixture: ComponentFixture<VideoPlayerComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let feedbackSpy: jasmine.SpyObj<FeedbackService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    feedbackSpy = jasmine.createSpyObj('FeedbackService', ['showError']);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: FeedbackService, useValue: feedbackSpy },
        {
          provide: ActivatedRoute, useValue: {
            queryParamMap: of({ get: (key: string) => key === 'url' ? 'testUrl' : null }),
          }
        },
      ],
      imports: [
        VideoPlayerComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getVideoDetails on ngOnInit if url exists', () => {
    let spy = spyOn(component, 'getVideoDetails').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith('testUrl');
  });

  it('should navigate to /main and show error if no URL', () => {
    spyOn(TestBed.inject(ActivatedRoute).queryParamMap, 'subscribe').and.callFake((cb: any) => cb({ get: () => null }));
    component.ngOnInit();
    expect(feedbackSpy.showError).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
  });

  it('should call removeUserFromPage if no token in getVideoDetails', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    let spy = spyOn(component, 'removeUserFromPage');
    component.getVideoDetails('someUrl');
    expect(spy).toHaveBeenCalled();
  });

  it('should call http.get in getVideoDetails if token exists', () => {
    spyOn(localStorage, 'getItem').and.callFake((key) => key === 'auth' ? 'abc' : 'en');
    component.video = { id: 1 } as any;
    component.getVideoDetails('someUrl');
    let req = httpMock.expectOne('someUrl');
    expect(req.request.method).toBe('GET');
    req.flush({ name: 'Test Video', video_urls: {}, watched_until: 0 });
  });

  it('should show and hide header correctly', fakeAsync(() => {
    let mockHeader = {
      nativeElement: { style: { transform: '', opacity: '' } },
    } as any;
    component.header = mockHeader;
    component.hidden = true;
    component.showHeader();
    expect(component.hidden).toBeFalse();
    expect(mockHeader.nativeElement.style.transform).toBe('translateY(0)');
    expect(mockHeader.nativeElement.style.opacity).toBe('1');
    tick(2500);
    expect(component.hidden).toBeTrue();
  }));

  it('should update watch progress every 6 seconds on timeupdate and on ended', () => {
    let mockPlayer: any = {
      on: jasmine.createSpy(), currentTime: jasmine.createSpy(),
      duration: jasmine.createSpy(), dispose: jasmine.createSpy()
    };
    component.player = mockPlayer;
    let updateSpy = spyOn(component, 'updateWatchProgress');
    component.watchTimer();
    const timeupdateCallback = mockPlayer.on.calls.all()
      .find((call: { args: string[]; }) => call.args[0] === 'timeupdate').args[1];
    const endedCallback = mockPlayer.on.calls.all()
      .find((call: { args: string[]; }) => call.args[0] === 'ended').args[1];
    mockPlayer.currentTime.and.returnValue(6);
    timeupdateCallback();
    expect(updateSpy).toHaveBeenCalledWith(6);
    mockPlayer.currentTime.and.returnValue(7);
    timeupdateCallback();
    expect(updateSpy).not.toHaveBeenCalledWith(7);
    mockPlayer.duration.and.returnValue(60);
    endedCallback();
    expect(updateSpy).toHaveBeenCalledWith(60);
    fixture.destroy();
  });
});
