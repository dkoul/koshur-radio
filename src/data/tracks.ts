/**
 * Curated Kashmiri track list — the single source of truth for the jukebox.
 * Static, hand-verified YouTube IDs. No live search, no API keys.
 */

export type TrackMood = 'classic' | 'folk' | 'contemporary' | 'film';

export interface Track {
  /** Stable internal ID, kebab-case. */
  id: string;
  title: string;
  artist: string;
  /** 11-char YouTube video ID. */
  youtubeId: string;
  /** Path under public/assets/covers/, or a full URL. */
  cover: string;
  /** Mood / era filter chip. */
  mood: TrackMood;
  /** Set true only after manually confirming the video embeds + plays. */
  verified: boolean;
}

/** Cover art from YouTube's thumbnail CDN. */
const ytCover = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/**
 * Starter set — oEmbed-verified 2026-08-10.
 * Final gate: in-browser playback through our own player before treating as production-safe.
 */
export const tracks: Track[] = [
  {
    id: 'hukus-bukus',
    title: 'Hukus Bukus',
    artist: 'Aabha Hanjura',
    youtubeId: 'pA9UPOSh3Ws',
    cover: ytCover('pA9UPOSh3Ws'),
    mood: 'folk',
    verified: true,
  },
  {
    id: 'gah-chon',
    title: 'Gah Chon',
    artist: 'Ali Saffudin',
    youtubeId: 'VTpp9XLVNTU',
    cover: ytCover('VTpp9XLVNTU'),
    mood: 'contemporary',
    verified: true,
  },
  {
    id: 'ride-home',
    title: 'Ride Home',
    artist: 'Alif · Noor Mohammad',
    youtubeId: 'ro2V-UJawro',
    cover: ytCover('ro2V-UJawro'),
    mood: 'contemporary',
    verified: true,
  },
  {
    id: 'habbakhatoon',
    title: 'Habbakhatoon',
    artist: 'Vibha Saraf',
    youtubeId: 'mxr1JkXPpSk',
    cover: ytCover('mxr1JkXPpSk'),
    mood: 'folk',
    verified: true,
  },
  {
    id: 'yeli-yaad-pewan',
    title: 'Yeli Yaad Pewan',
    artist: 'Shameema Dev Azad',
    youtubeId: '96tzUkCxoAk',
    cover: ytCover('96tzUkCxoAk'),
    mood: 'classic',
    verified: true,
  },
  {
    id: 'bumbro',
    title: 'Bumbro',
    artist: 'Mission Kashmir',
    youtubeId: '3JIDlmIrbw8',
    cover: ytCover('3JIDlmIrbw8'),
    mood: 'film',
    verified: true,
  },
  {
    id: 'kya-kya-wanai',
    title: 'Kya Kya Wanai',
    artist: 'Raj Begum',
    youtubeId: 'TcC71NQhmU8',
    cover: ytCover('TcC71NQhmU8'),
    mood: 'classic',
    verified: true,
  },
  {
    id: 'jaan-vandayo',
    title: 'Jaan Vandayo',
    artist: 'Ghulam Hassan Sofi',
    youtubeId: 'hQQDtJzhrOg',
    cover: ytCover('hQQDtJzhrOg'),
    mood: 'classic',
    verified: true,
  },
  {
    id: 'khanmoej-koor',
    title: 'Khanmoej Koor',
    artist: 'Aabha Hanjura',
    youtubeId: 'mKwmkBkgN6k',
    cover: ytCover('mKwmkBkgN6k'),
    mood: 'folk',
    verified: true,
  },
  {
    id: 'cheerith',
    title: 'Cheerith',
    artist: 'Alif',
    youtubeId: 'JGut3hKF4Pg',
    cover: ytCover('JGut3hKF4Pg'),
    mood: 'contemporary',
    verified: true,
  },
  {
    id: 'pooshi-matia',
    title: 'Pooshi Matia Walo',
    artist: 'Abid Bandpori',
    youtubeId: 'WkHI3N-GdhY',
    cover: ytCover('WkHI3N-GdhY'),
    mood: 'folk',
    verified: true,
  },
  {
    id: 'dilbaro-yuier',
    title: 'Dilbaro Yuier Valo',
    artist: 'Aabha Hanjura',
    youtubeId: '6p8tPr9Sy_Q',
    cover: ytCover('6p8tPr9Sy_Q'),
    mood: 'folk',
    verified: true,
  },
];
