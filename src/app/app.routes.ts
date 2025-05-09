import { Routes } from '@angular/router';
import { LegalNoticeComponent } from './home/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './home/privacy-policy/privacy-policy.component';
import { StartPageComponent } from './home/start-page/start-page.component';
import { LoginComponent } from './home/login/login.component';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { SignUpComponent } from './home/sign-up/sign-up.component';
import { MainPageComponent } from './home/main-page/main-page.component';
import { VideoPlayerComponent } from './home/video-player/video-player.component';
import { ResetPasswordComponent } from './home/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', component: StartPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot', component: ForgotPasswordComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'signUp', component: SignUpComponent },
    { path: 'main', component: MainPageComponent },
    { path: 'video', component: VideoPlayerComponent },
    { path: 'legal', component: LegalNoticeComponent },
    { path: 'privacy', component: PrivacyPolicyComponent },
];
