export const VIDEO_CATEGORIES = ['training', 'animals', 'nature', 'tutorials'];
type VideoCategory = typeof VIDEO_CATEGORIES[number];

export interface Video {
  name: string;
  url: string;
  type: VideoCategory | string;
  image: string;
  filePreview144p: string;
  descriptionEN: string;
  descriptionDE: string;
  uploaded_at: string;
}
