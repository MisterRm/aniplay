export interface FeaturedAnime {
  id: number;
  anime_slug: string;
  anime_title: string;
  anime_poster: string;
  order_index: number;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  is_active: boolean;
  download_url?: string;
  created_at: string;
}

export interface AnimeRaw {
  title: string;
  slug: string;
  poster: string;
  episode: string | null;
  type: string | null;
  score: string | null;
  status: string | null;
  release: string | null;
  genres: string[] | null;
  estimation: string | null;
}

export interface GenreItem {
  name: string;
  slug: string;
}

export interface EpisodeItem {
  name: string;
  slug: string;
}

export interface DetailPayload {
  title: string;
  poster: string;
  score: string;
  synopsis: string;
  trailer: string | null;
  type: string;
  status: string;
  aired: string;
  duration: string;
  studios: string;
  season: string;
  genres: GenreItem[];
  episodes: EpisodeItem[];
  recommended: AnimeRaw[];
}

export interface SamehadakuServerItem {
  title: string;
  serverId: string;
}

export interface SamehadakuQualityItem {
  title: string;
  serverList: SamehadakuServerItem[];
}

export interface EpisodePayload {
  title: string;
  animeId?: string;
  poster?: string;
  defaultStreamingUrl?: string;
  hasPrev: boolean;
  prevSlug: string | null;
  prevTitle?: string;
  hasNext: boolean;
  nextSlug: string | null;
  nextTitle?: string;
  qualities?: SamehadakuQualityItem[];
  streams?: { name: string; url: string }[];
}

export type AccentColor = 'red' | 'green' | 'blue' | 'purple' | 'orange';
export type TextSize = 'kecil' | 'sedang' | 'besar';
export type GridLayout = 'cols-2' | 'cols-3' | 'list';
export type DataSource = 'Dayynime-v1' | 'Dayynime-v2';
