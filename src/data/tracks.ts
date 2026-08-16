/**
 * Curated Kashmiri track list — the single source of truth for the jukebox.
 * Static, hand-verified YouTube IDs. No live search, no API keys.
 */

export type TrackMood =
  | 'classic'
  | 'folk'
  | 'contemporary'
  | 'watuk-puza'
  | 'leela';

/** User-facing chip / tag labels. `contemporary` stays Mix-only (no chip). */
export const MOOD_LABELS: Record<TrackMood, string> = {
  classic: 'Classic',
  folk: 'Folk',
  contemporary: 'Now',
  'watuk-puza': 'Watuk Puza',
  leela: 'Leela',
};

/** Filter chips, in display order. Omits moods that only appear in Mix. */
export const FILTER_CHIPS: TrackMood[] = [
  'classic',
  'folk',
  'watuk-puza',
  'leela',
];

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
 * Starter set + Watuk Puza + Leela (Kashmiri Bhajans playlist).
 * Watuk Puza: https://www.youtube.com/watch?v=slNbQdBwdXk
 * Leela playlist: https://www.youtube.com/playlist?list=PL9h-vwkXL7F28KRfrscN19O-SxPZz0rey
 * oEmbed / innertube verified 2026-08-10. Unplayable IDs auto-skip at runtime.
 */
export const tracks: Track[] = [
  // --- Classic / Folk / Contemporary ---------------------------------------
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

  // --- Watuk Puza ----------------------------------------------------------
  {
    id: 'watuk-puza',
    title: 'Watuk Puza',
    artist: 'Posheen Razdan',
    youtubeId: 'slNbQdBwdXk',
    cover: ytCover('slNbQdBwdXk'),
    mood: 'watuk-puza',
    verified: true,
  },

  // --- Leela (Kashmiri Bhajans / Bright Sky Productions) -------------------
  {
    id: 'aasay-sharan-kartam-daya',
    title: 'Aasay Sharan Kartam Daya',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: '5TktID5OeNg',
    cover: ytCover('5TktID5OeNg'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'kalp-vriksh-gajanannam',
    title: 'Kalp Vriksh Bhaktraksh Namostute',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: 'jtlB6yNGuuY',
    cover: ytCover('jtlB6yNGuuY'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'indrakshi-namsa-devi',
    title: 'Indrakshi Namsa Devi',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: 'O0JTdp0sJEo',
    cover: ytCover('O0JTdp0sJEo'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'atee-bhishan-katu-bhashan',
    title: 'Atee Bhishan Katu Bhashan',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: 'dW2ZWhSzVgI',
    cover: ytCover('dW2ZWhSzVgI'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'shivnath-avinashey',
    title: 'Shivnath Avinashey',
    artist: 'Amar Nath Koul',
    youtubeId: 'jI2DteW8H1M',
    cover: ytCover('jI2DteW8H1M'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'soor-mottye-aangan-tchaav',
    title: 'Soor Mottye Aangan Tchaav',
    artist: 'Bright Sky Productions',
    youtubeId: 'R89Yl7bfPu0',
    cover: ytCover('R89Yl7bfPu0'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'soor-matyi-sorfe-gosaney',
    title: 'Soor Matyi Sorfe Gosaney',
    artist: 'Amar Nath Koul',
    youtubeId: 'w00busx6Z3M',
    cover: ytCover('w00busx6Z3M'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'hee-sada-shiv-shankar',
    title: 'Hee Sada Shiv Shankar Trishooldhæri',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: 'lZVZyQaRj5E',
    cover: ytCover('lZVZyQaRj5E'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'be-maejaei-kehnti',
    title: 'Be Mæjæi Kehnti Zanai Ne Pooz Chæni',
    artist: 'Poozai Posh · Bright Sky',
    youtubeId: 'odsqUDh1Wro',
    cover: ytCover('odsqUDh1Wro'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'arni-rang-gom',
    title: 'Arni Rang Gom',
    artist: 'Poozai Posh · Arnimaal',
    youtubeId: 'A8neuSNMzOE',
    cover: ytCover('A8neuSNMzOE'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'venposh',
    title: 'Venposh',
    artist: 'Santosh Shah Nadaan',
    youtubeId: 'X3w27LU-_lk',
    cover: ytCover('X3w27LU-_lk'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'huma-aslay-maheshwar',
    title: 'Huma Aslay Maheshwar Bood',
    artist: 'Mohiuddin Balapuri',
    youtubeId: 'DgZPfo_vltQ',
    cover: ytCover('DgZPfo_vltQ'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'mahimnapar-kashmiri',
    title: 'Mahimnapar Kashmiri',
    artist: 'Rajinder & Vijay Lakshmi Kachroo',
    youtubeId: 'p7nwpB9tsMk',
    cover: ytCover('p7nwpB9tsMk'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'harmukh-bartal-praray',
    title: 'Harmukh Bartal Praray Madano',
    artist: 'Vijay Malla · Archana Jalali Tickoo',
    youtubeId: '905lQuxf398',
    cover: ytCover('905lQuxf398'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'gauri-amba-kashmiri',
    title: 'Gauri Amba Kashmiri',
    artist: 'Poozai Posh · Leela Rabda',
    youtubeId: 'UHcECP4rkEs',
    cover: ytCover('UHcECP4rkEs'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'guru-vandana',
    title: 'Guru Vandana',
    artist: 'Vijay Malla',
    youtubeId: '2nYtoB_XT5U',
    cover: ytCover('2nYtoB_XT5U'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'panchastavi-kashmiri',
    title: 'Panchastavi in Kashmiri',
    artist: 'Vir House · Bright Sky',
    youtubeId: '20dDJ2a2L2o',
    cover: ytCover('20dDJ2a2L2o'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'bel-tai-madal-harmukh',
    title: 'Bel Tai Madal',
    artist: 'Harmukh Kaney',
    youtubeId: 'y177sEe3l7s',
    cover: ytCover('y177sEe3l7s'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'guru-geeta-kashmiri',
    title: 'Guru Geeta Kashmiri',
    artist: 'Ashok Raina',
    youtubeId: 'xR899xX3yCk',
    cover: ytCover('xR899xX3yCk'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'shri-amarnath-myani',
    title: 'Shri Amarnath Myani Dhyaneshwaro',
    artist: 'Poshkar Nath Trakroo Pawan',
    youtubeId: '9y-ZV5NyFtE',
    cover: ytCover('9y-ZV5NyFtE'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'saniyasai-ha-gosaney',
    title: 'Saniyasai Ha Gosaney',
    artist: 'Vijay Malla · Archana Jalali Tickoo',
    youtubeId: 'xunmf3UXC6Y',
    cover: ytCover('xunmf3UXC6Y'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'bel-tai-madal-kailash',
    title: 'Bel Tai Madal',
    artist: 'Kailash Mehra Sadhu',
    youtubeId: '9Gcw3G1ELrw',
    cover: ytCover('9Gcw3G1ELrw'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'shaam-roopai-roi',
    title: 'Shaam Roopai Roi Mye Hownam',
    artist: 'Amar Nath Koul',
    youtubeId: 'HhcejD1uXKE',
    cover: ytCover('HhcejD1uXKE'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'panchastavi-charchastav',
    title: 'Panchastavi CharchaStav',
    artist: 'Sharan Tickoo',
    youtubeId: 'u5hmVrNEmpo',
    cover: ytCover('u5hmVrNEmpo'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'aadhaar-zagtuk',
    title: 'Aadhaar Zagtuk Kunui Ch Mantar',
    artist: 'Darshana Mehra · Poozai Posh',
    youtubeId: '2ompR0hKG_Q',
    cover: ytCover('2ompR0hKG_Q'),
    mood: 'leela',
    verified: true,
  },
  {
    id: 'ati-bhishan-baramulla',
    title: 'Ati Bhishan Katu Bhashan',
    artist: 'Bright Sky Productions',
    youtubeId: '5KBJnMLwL6M',
    cover: ytCover('5KBJnMLwL6M'),
    mood: 'leela',
    verified: true,
  },
];
