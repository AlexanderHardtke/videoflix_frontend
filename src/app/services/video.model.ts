export const VIDEO_CATEGORIES = ['training', 'animals', 'nature', 'tutorials'];
type VideoCategory = typeof VIDEO_CATEGORIES[number];

export interface Video {
  name: string;
  url: string;
  type: VideoCategory | string;
  image: string;
  bigImage: string;
  filePreview144p: string;
  descriptionEN: string;
  descriptionDE: string;
  uploaded_at: string;
}

export interface VideoDetail {
    id: number;
    name: string;
    file1080p: string;
    file720p: string;
    file360p: string;
    file240p: string;
    watched_until: number;
}