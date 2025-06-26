import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FeedbackService } from '../services/feedback.service';
import { FeedbackOverlayComponent } from './feedback-overlay.component';
import { By } from '@angular/platform-browser';

describe('FeedbackOverlayComponent', () => {
  let component: FeedbackOverlayComponent;
  let fixture: ComponentFixture<FeedbackOverlayComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackOverlayComponent],
      providers: [FeedbackService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FeedbackOverlayComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display feedback text', () => {
    component.feedbackText = 'test';
    component.visible = true;
    fixture.detectChanges();
    const text = nativeElement.querySelector('p');
    expect(text?.textContent).toContain('test');
    expect(component.feedbackText).toBe('test')
  })

  it('should display feedback box via method and set timeout', () => {
    jasmine.clock().install();
    component.showFeedback('test feedback');
    fixture.detectChanges();
    expect(component.visible).toBeTrue();
    jasmine.clock().tick(31);
    expect(component.isActive).toBeTrue();
    jasmine.clock().tick(3000);
    expect(component.isActive).toBeFalse();
    jasmine.clock().tick(250);
    expect(component.feedbackText).toBeNull();
    jasmine.clock().uninstall();
  });

  it('should display error text', () => {
    component.errorText = 'test';
    component.visible = true;
    fixture.detectChanges();
    const text = nativeElement.querySelector('p');
    expect(component.errorText).toBe('test')
    expect(text?.textContent).toContain('test');
  })

  it('should display error, then close via a-tag click', () => {
    jasmine.clock().install();
    component.showErrorText('test error');
    fixture.detectChanges();
    expect(component.visible).toBeTrue();
    jasmine.clock().tick(31);
    fixture.detectChanges();
    expect(component.isActive).toBeTrue();
    const closeButton = fixture.debugElement.query(By.css('a'));
    expect(closeButton).toBeTruthy();
    closeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.isActive).toBeFalse();
    jasmine.clock().tick(250);
    expect(component.feedbackText).toBeNull();
    jasmine.clock().uninstall();
  });

  it('should close existing error and display new one', fakeAsync(() => {
    component.checkError('test error 1');
    fixture.detectChanges();
    expect(component.errorText).toBe('test error 1');
    component.checkError('test error 2');
    fixture.detectChanges();
    expect(component.errorText).toBe('test error 1');
    tick(251);
    fixture.detectChanges();
    expect(component.errorText).toBe('test error 2');
  }));
});
