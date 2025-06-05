import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BackgroundService {
    private backgroundUrl = new BehaviorSubject<string>('../assets/img/background.jp');
    background$ = this.backgroundUrl.asObservable();

    public setBackgroundForRoute(route: string) {
        const backgrounds: Record<string, string> = {
            '/login': '../assets/img/background2.jpg',
            '/signUp': '../assets/img/background3.jpg',
        };

        const fallback = '../assets/img/background.jpg';
        const bg = backgrounds[route] ?? fallback;
        this.backgroundUrl.next(bg);
    }
}