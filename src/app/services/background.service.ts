import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({ providedIn: 'root' })
export class BackgroundService {
    private backgroundUrl = new BehaviorSubject<string>('../assets/img/background.jp');
    background$ = this.backgroundUrl.asObservable();

    /**
     * sets the backgroundimage for the corresponding route
     * 
     * @param route the url from the browser
     */
    public setBackgroundForRoute(route: string) {
        const backgrounds: Record<string, string> = {
            '/login': '../assets/img/background2.jpg',
            '/forgot': '../assets/img/background2.jpg',
            '/signUp': '../assets/img/background3.jpg',
            '/check': '../assets/img/background3.jpg',
            '/info': '../assets/img/backgroundTrans.png',
        };
        const fallback = '../assets/img/background.jpg';
        const bg = backgrounds[route] ?? fallback;
        this.backgroundUrl.next(bg);
    }

    /**
     * sets a dynamic background image from another component
     * 
     * @param img the location of the image in the folder
     */
    public setDynamicBackground(img: string) {
        if (img === '') this.backgroundUrl.next('../assets/img/backgroundTrans.png');
        else this.backgroundUrl.next(img);
    }
}