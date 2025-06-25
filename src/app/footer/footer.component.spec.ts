import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { RouterModule } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide footer on /info', () => {
    component.currentUrl = '/info';
    fixture.detectChanges();

    const section = fixture.debugElement.query(By.css('section'));
    expect(section.nativeElement.classList).toContain('d-none');
  });

  it('should add class to-side on /main', () => {
    component.currentUrl = '/main';
    fixture.detectChanges();
    const section = fixture.debugElement.query(By.css('section'));
    expect(section.nativeElement.classList).toContain('to-side');
  });

  it('should contain links to /privacy and /legal', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(2);
    expect(links[0].attributes['ng-reflect-router-link']).toBe('/privacy');
    expect(links[1].attributes['ng-reflect-router-link']).toBe('/legal');
  });
});
