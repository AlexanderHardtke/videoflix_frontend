import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackOverlayComponent } from './feedback-overlay.component';

describe('FeedbackOverlayComponent', () => {
  let component: FeedbackOverlayComponent;
  let fixture: ComponentFixture<FeedbackOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
