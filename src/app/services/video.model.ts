// DO not change the 'new' category
export const VIDEO_CATEGORIES = ['new', 'training', 'animals', 'nature', 'tutorials'];
type VideoCategory = typeof VIDEO_CATEGORIES[number];

export interface Video {
  name: string;
  url: string;
  video_type: VideoCategory | string;
  image: string;
  big_image: string;
  file_preview144p: string;
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
}

export interface VideoApiResponse {
  list: Video[];
  count: number;
  list_size: number;
  list_page: number;
  has_next: boolean;
  next: string;
}