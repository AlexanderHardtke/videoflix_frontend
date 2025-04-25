import { Routes } from '@angular/router';
import { LegalNoticeComponent } from './home/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './home/privacy-policy/privacy-policy.component';
import { StartPageComponent } from './home/start-page/start-page.component';

export const routes: Routes = [
    { path: '', component: StartPageComponent },
    { path: 'legal', component: LegalNoticeComponent },
    { path: 'privacy', component: PrivacyPolicyComponent },
];
