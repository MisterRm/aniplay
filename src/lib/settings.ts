import { AccentColor, TextSize, GridLayout, DataSource } from '../types';

export interface SavedAnime {
  slug: string;
  title: string;
  poster: string;
  episode?: string | null;
  score?: string | null;
  type?: string | null;
  genres?: string[] | null;
}

export interface HistoryItem extends SavedAnime {
  watchedAt: string;
  lastEpisode?: string;
  lastEpisodeSlug?: string;
}

const STORAGE_KEYS = {
  ACCENT_COLOR: 'aniplay_accent_color',
  TEXT_SIZE: 'aniplay_text_size',
  GRID_LAYOUT: 'aniplay_grid_layout',
  DATA_SOURCE: 'aniplay_data_source',
  FAVORITES: 'aniplay_favorites',
  HISTORY: 'aniplay_history',
};

export const settings = {
  getAccentColor(): AccentColor {
    return (localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) as AccentColor) || 'red';
  },
  setAccentColor(color: AccentColor): void {
    localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
    window.dispatchEvent(new Event('settings_changed'));
  },

  getTextSize(): TextSize {
    return (localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as TextSize) || 'sedang';
  },
  setTextSize(size: TextSize): void {
    localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
    window.dispatchEvent(new Event('settings_changed'));
  },

  getGridLayout(): GridLayout {
    return (localStorage.getItem(STORAGE_KEYS.GRID_LAYOUT) as GridLayout) || 'cols-2';
  },
  setGridLayout(layout: GridLayout): void {
    localStorage.setItem(STORAGE_KEYS.GRID_LAYOUT, layout);
    window.dispatchEvent(new Event('settings_changed'));
  },

  getDataSource(): DataSource {
    return (localStorage.getItem(STORAGE_KEYS.DATA_SOURCE) as DataSource) || 'Dayynime-v1';
  },
  setDataSource(source: DataSource): void {
    localStorage.setItem(STORAGE_KEYS.DATA_SOURCE, source);
    window.dispatchEvent(new Event('settings_changed'));
  },

  getFavorites(): SavedAnime[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  isFavorite(slug: string): boolean {
    return this.getFavorites().some((item) => item.slug === slug);
  },
  toggleFavorite(anime: SavedAnime): boolean {
    const list = this.getFavorites();
    const index = list.findIndex((item) => item.slug === anime.slug);
    let isFav = false;
    if (index !== -1) {
      list.splice(index, 1);
    } else {
      list.push(anime);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    window.dispatchEvent(new Event('favorites_changed'));
    return isFav;
  },

  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addToHistory(anime: SavedAnime, episodeName?: string, episodeSlug?: string): void {
    const list = this.getHistory();
    const filtered = list.filter((item) => item.slug !== anime.slug);
    
    const newItem: HistoryItem = {
      ...anime,
      watchedAt: new Date().toISOString(),
      lastEpisode: episodeName,
      lastEpisodeSlug: episodeSlug,
    };
    
    // Limit history to 50 items
    const updated = [newItem, ...filtered].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    window.dispatchEvent(new Event('history_changed'));
  },
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    window.dispatchEvent(new Event('history_changed'));
  }
};
