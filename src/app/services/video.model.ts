// DO NOT change the 'new' category
export const VIDEO_CATEGORIES = ['new', 'training', 'animals', 'nature', 'tutorials'];
type VideoCategory = typeof VIDEO_CATEGORIES[number];

export const minVidForRes = [
  { maxWidth: 400, minVideos: 2 },
  { maxWidth: 700, minVideos: 3 },
  { maxWidth: 1100, minVideos: 4 },
  { maxWidth: 1920, minVideos: 5 },
  { maxWidth: Infinity, minVideos: 6 }
];

export interface Video {
  name: string;
  url: string;
  video_type: VideoCategory | string;
  image: string;
  big_image: string;
  file_preview144p: string;
  watched_until: number | null;
  duration: number;
  description_en: string;
  description_de: string;
  uploaded_at: string;
}

export interface VideoDetail {
  id: number;
  name: string;
  video_urls: {
    "1080p": string;
    "720p": string;
    "360p": string;
    "240p": string;
  };
  watched_until: number;
  watched_until_id: number;
  sound_volume: number;
}

export interface VideoApiResponse {
  list: Video[];
  count: number;
  list_size: number;
  list_page: number;
  has_next: boolean;
  next: string;
}