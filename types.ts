export interface SocialPosts {
  instagram: string;
  tiktok: string;
  facebook: string;
}

export interface ImagenParams {
  prompt: string;
  aspect_ratio: string;
}

export interface VeoParams {
  prompt: string;
  aspect_ratio: string;
}

export interface AnalysisResult {
  is_valid: boolean;
  error_message: string | null;
  product_title: string;
  seo_description: string;
  social_posts: SocialPosts;
  imagen_params: ImagenParams;
  veo_params: VeoParams;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
