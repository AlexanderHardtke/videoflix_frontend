import { TestBed } from '@angular/core/testing';

import { VideoTransferService } from './video-transfer.service';
import { Video } from './video.model';


describe('VideoTransferService', () => {
    let service: VideoTransferService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VideoTransferService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the video', () => {
        let testVideo: Video = {
            name: 'Test Video',
            url: 'https://example.com/video.mp4',
            video_type: 'training',
            image: 'https://example.com/image.jpg',
            big_image: 'https://example.com/big_image.jpg',
            file_preview144p: 'https://example.com/preview.mp4',
            watched_until: 0,
            duration: 120,
            description_en: 'Test description in English',
            description_de: 'Test Beschreibung auf Deutsch',
            uploaded_at: '2024-01-01T00:00:00Z'
        };
        service.setVideo(testVideo);
        expect(service.getVideo()).toBe(testVideo);
    })
});
