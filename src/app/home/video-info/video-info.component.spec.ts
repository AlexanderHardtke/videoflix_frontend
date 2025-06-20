import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInfoComponent } from './video-info.component';

describe('VideoInfoComponent', () => {
  let component: VideoInfoComponent;
  let fixture: ComponentFixture<VideoInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
