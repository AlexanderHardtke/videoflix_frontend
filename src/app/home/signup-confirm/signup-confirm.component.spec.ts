import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupConfirmComponent } from './signup-confirm.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SignupConfirmComponent', () => {
  let component: SignupConfirmComponent;
  let fixture: ComponentFixture<SignupConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ],
      imports: [
        SignupConfirmComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SignupConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
