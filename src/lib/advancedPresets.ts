// ============================================
// AKEEF STUDIO AI - ADVANCED PRESETS LIBRARY
// Comprehensive LUTs, Effects, and Transitions
// ============================================

// ============================================
// EXTENDED CINEMATIC LUTS (40+ Professional Looks)
// ============================================

export interface ExtendedLUT {
  id: string;
  name: string;
  description: string;
  category: 'hollywood' | 'film_stock' | 'stylized' | 'broadcast' | 'music_video' | 'documentary' | 'vintage' | 'specialty';
  thumbnail: string;
  lut: string;
  settings: {
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
    shadows: number;
    highlights: number;
    lift: number;
    gamma: number;
    gain: number;
  };
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCase: string;
}

export const EXTENDED_LUTS: ExtendedLUT[] = [
  // === HOLLYWOOD BLOCKBUSTERS ===
  {
    id: 'teal_orange',
    name: 'Teal & Orange',
    description: 'The iconic Hollywood blockbuster look - Transformers, Mad Max',
    category: 'hollywood',
    thumbnail: 'teal-orange',
    lut: 'ARRI_TEAL_ORANGE_33',
    settings: { contrast: 1.2, saturation: 0.95, temperature: -8, tint: 0, shadows: -12, highlights: 8, lift: -0.02, gamma: 1.0, gain: 1.05 },
    tags: ['action', 'blockbuster', 'summer', 'warm'],
    difficulty: 'beginner',
    useCase: 'Action sequences, blockbuster trailers',
  },
  {
    id: 'blockbuster_action',
    name: 'Blockbuster Action',
    description: 'High-contrast dramatic sky look - Michael Bay style',
    category: 'hollywood',
    thumbnail: 'blockbuster',
    lut: 'HOLLYWOOD_BLOCKBUSTER_V2',
    settings: { contrast: 1.35, saturation: 1.1, temperature: -5, tint: 0, shadows: -15, highlights: 12, lift: -0.03, gamma: 0.98, gain: 1.1 },
    tags: ['action', 'dramatic', 'explosion', 'summer'],
    difficulty: 'intermediate',
    useCase: 'Action films, explosions, dramatic reveals',
  },
  {
    id: 'thriller_cold',
    name: 'Thriller Cold',
    description: 'Desaturated cold blue tones - Fincher films',
    category: 'hollywood',
    thumbnail: 'thriller-cold',
    lut: 'THRILLER_BLUE_STEEL',
    settings: { contrast: 1.25, saturation: 0.7, temperature: -20, tint: -5, shadows: -18, highlights: 0, lift: 0.01, gamma: 0.95, gain: 0.98 },
    tags: ['thriller', 'suspense', 'cold', 'dark'],
    difficulty: 'intermediate',
    useCase: 'Thriller, mystery, psychological drama',
  },
  {
    id: 'horror_teal',
    name: 'Horror Atmosphere',
    description: 'Dark teal horror film aesthetic - misty and eerie',
    category: 'hollywood',
    thumbnail: 'horror-teal',
    lut: 'HORROR_TEAL_MIST',
    settings: { contrast: 1.35, saturation: 0.6, temperature: -25, tint: -8, shadows: -25, highlights: -5, lift: 0.0, gamma: 0.88, gain: 0.92 },
    tags: ['horror', 'dark', 'atmospheric', 'eerie'],
    difficulty: 'advanced',
    useCase: 'Horror films, supernatural thrillers',
  },
  {
    id: 'desert_orange',
    name: 'Desert Heat',
    description: 'Warm orange desert tones - Mad Max, Dune style',
    category: 'hollywood',
    thumbnail: 'desert-orange',
    lut: 'DESERT_HEAT_PRO',
    settings: { contrast: 1.3, saturation: 0.9, temperature: 30, tint: 5, shadows: -10, highlights: 15, lift: -0.02, gamma: 0.95, gain: 1.08 },
    tags: ['desert', 'warm', 'epic', 'adventure'],
    difficulty: 'beginner',
    useCase: 'Desert scenes, post-apocalyptic, western',
  },
  {
    id: 'moody_desat',
    name: 'Moody Desaturated',
    description: 'Dark atmospheric look - Game of Thrones style',
    category: 'hollywood',
    thumbnail: 'moody-desat',
    lut: 'MOODY_DESAT_PRO',
    settings: { contrast: 1.3, saturation: 0.55, temperature: -12, tint: 0, shadows: -20, highlights: -5, lift: 0.02, gamma: 0.92, gain: 0.95 },
    tags: ['moody', 'dark', 'atmospheric', 'cinematic'],
    difficulty: 'intermediate',
    useCase: 'Drama, period pieces, fantasy',
  },
  {
    id: 'bleach_bypass',
    name: 'Bleach Bypass',
    description: 'Desaturated high contrast - Saving Private Ryan',
    category: 'hollywood',
    thumbnail: 'bleach-bypass',
    lut: 'BLEACH_BYPASS_PRO',
    settings: { contrast: 1.45, saturation: 0.4, temperature: -5, tint: 0, shadows: -20, highlights: 10, lift: 0.0, gamma: 0.9, gain: 1.05 },
    tags: ['war', 'gritty', 'desaturated', 'intense'],
    difficulty: 'advanced',
    useCase: 'War films, gritty drama, historical',
  },

  // === FILM STOCK EMULATIONS ===
  {
    id: 'kodak_gold',
    name: 'Kodak Gold 200',
    description: 'Classic Kodak film warmth - nostalgic golden tones',
    category: 'film_stock',
    thumbnail: 'kodak-gold',
    lut: 'KODAK_GOLD_200_EMU',
    settings: { contrast: 1.1, saturation: 1.05, temperature: 15, tint: 5, shadows: 5, highlights: -3, lift: 0.01, gamma: 1.02, gain: 1.02 },
    tags: ['film', 'warm', 'nostalgic', 'golden'],
    difficulty: 'beginner',
    useCase: 'Nostalgic content, travel videos, portraits',
  },
  {
    id: 'fuji_velvia',
    name: 'Fuji Velvia 50',
    description: 'Vivid greens and rich blues - legendary landscape film',
    category: 'film_stock',
    thumbnail: 'fuji-velvia',
    lut: 'FUJI_VELVIA_50_EMU',
    settings: { contrast: 1.15, saturation: 1.25, temperature: -5, tint: -3, shadows: -5, highlights: 5, lift: -0.01, gamma: 1.0, gain: 1.05 },
    tags: ['film', 'vivid', 'landscape', 'nature'],
    difficulty: 'beginner',
    useCase: 'Landscape, nature documentaries, travel',
  },
  {
    id: 'vintage_film',
    name: 'Vintage 35mm',
    description: 'Warm sepia-toned analog film - 1970s cinema',
    category: 'film_stock',
    thumbnail: 'vintage-film',
    lut: 'VINTAGE_35MM_WARM',
    settings: { contrast: 1.1, saturation: 0.85, temperature: 12, tint: 8, shadows: 8, highlights: -8, lift: 0.02, gamma: 1.03, gain: 0.98 },
    tags: ['vintage', 'retro', 'warm', 'nostalgic'],
    difficulty: 'beginner',
    useCase: 'Period pieces, vintage aesthetic, nostalgia',
  },
  {
    id: 'bw_classic',
    name: 'Classic B&W',
    description: 'High contrast black and white - film noir style',
    category: 'film_stock',
    thumbnail: 'bw-classic',
    lut: 'BW_CLASSIC_NOIR',
    settings: { contrast: 1.4, saturation: 0.0, temperature: 0, tint: 0, shadows: -15, highlights: 10, lift: 0.0, gamma: 0.95, gain: 1.1 },
    tags: ['bw', 'noir', 'classic', 'dramatic'],
    difficulty: 'beginner',
    useCase: 'Artistic projects, noir films, documentaries',
  },
  {
    id: 'noir_detective',
    name: 'Noir Detective',
    description: 'Dark shadows with dramatic contrast - 1940s noir',
    category: 'film_stock',
    thumbnail: 'noir-detective',
    lut: 'NOIR_DETECTIVE_40S',
    settings: { contrast: 1.5, saturation: 0.0, temperature: 0, tint: 0, shadows: -30, highlights: 15, lift: 0.0, gamma: 0.85, gain: 1.15 },
    tags: ['noir', 'detective', 'shadows', 'classic'],
    difficulty: 'intermediate',
    useCase: 'Crime films, noir aesthetic, mystery',
  },
  {
    id: 'sepia_western',
    name: 'Sepia Western',
    description: 'Warm brown sepia tones - classic Americana',
    category: 'film_stock',
    thumbnail: 'sepia-western',
    lut: 'SEPIA_WESTERN_CLASSIC',
    settings: { contrast: 1.15, saturation: 0.6, temperature: 25, tint: 12, shadows: 5, highlights: -5, lift: 0.03, gamma: 1.05, gain: 0.95 },
    tags: ['sepia', 'western', 'vintage', 'americana'],
    difficulty: 'beginner',
    useCase: 'Western films, period pieces, historical',
  },
  {
    id: 'polaroid_fade',
    name: 'Polaroid Fade',
    description: 'Faded Polaroid with light leaks - 70s party aesthetic',
    category: 'film_stock',
    thumbnail: 'polaroid-fade',
    lut: 'POLAROID_INSTANT_70S',
    settings: { contrast: 0.95, saturation: 0.8, temperature: 10, tint: 8, shadows: 15, highlights: -15, lift: 0.05, gamma: 1.1, gain: 0.9 },
    tags: ['polaroid', 'instant', 'faded', 'nostalgic'],
    difficulty: 'beginner',
    useCase: 'Home videos, nostalgic content, indie films',
  },

  // === STYLIZED LOOKS ===
  {
    id: 'neon_nights',
    name: 'Neon Nights',
    description: 'Cyberpunk purple and cyan - Blade Runner aesthetic',
    category: 'stylized',
    thumbnail: 'neon-nights',
    lut: 'NEON_CYBERPUNK_V3',
    settings: { contrast: 1.4, saturation: 1.3, temperature: -18, tint: 15, shadows: -25, highlights: 18, lift: -0.02, gamma: 0.9, gain: 1.15 },
    tags: ['neon', 'cyberpunk', 'night', 'futuristic'],
    difficulty: 'intermediate',
    useCase: 'Night scenes, urban, cyberpunk, music videos',
  },
  {
    id: 'cyberpunk_city',
    name: 'Cyberpunk City',
    description: 'Intense purple/pink neon city at night',
    category: 'stylized',
    thumbnail: 'cyberpunk-city',
    lut: 'CYBERPUNK_NEON_CITY',
    settings: { contrast: 1.45, saturation: 1.4, temperature: -20, tint: 25, shadows: -30, highlights: 20, lift: -0.03, gamma: 0.88, gain: 1.2 },
    tags: ['cyberpunk', 'neon', 'city', 'futuristic'],
    difficulty: 'advanced',
    useCase: 'Sci-fi, futuristic, urban night scenes',
  },
  {
    id: 'scifi_green',
    name: 'Sci-Fi Green',
    description: 'Matrix-inspired green tint - digital technology',
    category: 'stylized',
    thumbnail: 'scifi-green',
    lut: 'SCIFI_GREEN_MATRIX',
    settings: { contrast: 1.25, saturation: 0.9, temperature: -10, tint: -20, shadows: -15, highlights: 5, lift: 0.0, gamma: 0.95, gain: 1.05 },
    tags: ['scifi', 'green', 'matrix', 'digital'],
    difficulty: 'intermediate',
    useCase: 'Tech content, sci-fi, hacking sequences',
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    description: 'Warm amber sunset glow - romantic cinematic',
    category: 'stylized',
    thumbnail: 'golden-hour',
    lut: 'GOLDEN_HOUR_WARM',
    settings: { contrast: 1.05, saturation: 1.1, temperature: 25, tint: 5, shadows: 0, highlights: -5, lift: 0.02, gamma: 1.05, gain: 1.0 },
    tags: ['warm', 'golden', 'romantic', 'sunset'],
    difficulty: 'beginner',
    useCase: 'Romance, weddings, golden hour shoots',
  },
  {
    id: 'romance_soft',
    name: 'Romance Soft',
    description: 'Dreamy pastel pink tones - wedding films',
    category: 'stylized',
    thumbnail: 'romance-soft',
    lut: 'ROMANCE_PASTEL_SOFT',
    settings: { contrast: 0.95, saturation: 0.9, temperature: 8, tint: 12, shadows: 10, highlights: -10, lift: 0.03, gamma: 1.08, gain: 0.95 },
    tags: ['romantic', 'soft', 'pastel', 'wedding'],
    difficulty: 'beginner',
    useCase: 'Weddings, romantic content, soft portraiture',
  },
  {
    id: 'dreamy_wedding',
    name: 'Dreamy Wedding',
    description: 'Ethereal soft focus with warm highlights',
    category: 'stylized',
    thumbnail: 'dreamy-wedding',
    lut: 'DREAMY_WEDDING_PRO',
    settings: { contrast: 0.9, saturation: 0.85, temperature: 10, tint: 15, shadows: 15, highlights: -15, lift: 0.04, gamma: 1.12, gain: 0.92 },
    tags: ['dreamy', 'wedding', 'ethereal', 'soft'],
    difficulty: 'beginner',
    useCase: 'Weddings, bridal, romantic moments',
  },
  {
    id: 'beach_summer',
    name: 'Beach Summer',
    description: 'Teal shadows with warm highlights - beach vibes',
    category: 'stylized',
    thumbnail: 'beach-summer',
    lut: 'BEACH_SUMMER_TEAL',
    settings: { contrast: 1.15, saturation: 1.1, temperature: 5, tint: -5, shadows: -8, highlights: 5, lift: -0.01, gamma: 1.02, gain: 1.05 },
    tags: ['beach', 'summer', 'teal', 'vibrant'],
    difficulty: 'beginner',
    useCase: 'Beach content, summer videos, travel',
  },
  {
    id: 'tropical_vibrant',
    name: 'Tropical Paradise',
    description: 'Saturated turquoise waters and lush greens',
    category: 'stylized',
    thumbnail: 'tropical-vibrant',
    lut: 'TROPICAL_PARADISE_SAT',
    settings: { contrast: 1.1, saturation: 1.35, temperature: -8, tint: -5, shadows: 0, highlights: 5, lift: 0.0, gamma: 1.0, gain: 1.05 },
    tags: ['tropical', 'vibrant', 'beach', 'paradise'],
    difficulty: 'beginner',
    useCase: 'Travel videos, resort content, vacation',
  },
  {
    id: 'autumn_warm',
    name: 'Autumn Warmth',
    description: 'Warm orange and red fall tones',
    category: 'stylized',
    thumbnail: 'autumn-warm',
    lut: 'AUTUMN_FALL_WARM',
    settings: { contrast: 1.15, saturation: 1.15, temperature: 20, tint: 5, shadows: -5, highlights: 0, lift: 0.01, gamma: 1.02, gain: 1.02 },
    tags: ['autumn', 'fall', 'warm', 'orange'],
    difficulty: 'beginner',
    useCase: 'Fall content, seasonal videos, nature',
  },
  {
    id: 'nordic_cold',
    name: 'Nordic Cold',
    description: 'Cold blue winter tones - icy and crisp',
    category: 'stylized',
    thumbnail: 'nordic-cold',
    lut: 'NORDIC_WINTER_COLD',
    settings: { contrast: 1.2, saturation: 0.85, temperature: -25, tint: -5, shadows: -10, highlights: 5, lift: 0.02, gamma: 0.98, gain: 1.0 },
    tags: ['nordic', 'cold', 'winter', 'blue'],
    difficulty: 'intermediate',
    useCase: 'Winter scenes, Nordic content, cold aesthetic',
  },
  {
    id: 'deep_ocean',
    name: 'Deep Ocean',
    description: 'Underwater blue tones with light rays',
    category: 'stylized',
    thumbnail: 'deep-ocean',
    lut: 'DEEP_OCEAN_BLUE',
    settings: { contrast: 1.1, saturation: 0.9, temperature: -30, tint: -10, shadows: -15, highlights: 10, lift: 0.0, gamma: 0.95, gain: 1.0 },
    tags: ['ocean', 'underwater', 'blue', 'aquatic'],
    difficulty: 'intermediate',
    useCase: 'Underwater footage, ocean documentaries',
  },
  {
    id: 'chiaroscuro',
    name: 'Chiaroscuro',
    description: 'Renaissance-style dramatic lighting',
    category: 'stylized',
    thumbnail: 'chiaroscuro',
    lut: 'CHIAROSCURO_DRAMATIC',
    settings: { contrast: 1.5, saturation: 0.7, temperature: 5, tint: 0, shadows: -35, highlights: 20, lift: -0.02, gamma: 0.82, gain: 1.1 },
    tags: ['dramatic', 'renaissance', 'dark', 'artistic'],
    difficulty: 'advanced',
    useCase: 'Artistic portraits, dramatic scenes',
  },

  // === MUSIC VIDEO LOOKS ===
  {
    id: 'vibrant_pop',
    name: 'Vibrant Pop',
    description: 'High saturation punchy colors - music video energy',
    category: 'music_video',
    thumbnail: 'vibrant-pop',
    lut: 'VIBRANT_POP_MV',
    settings: { contrast: 1.3, saturation: 1.4, temperature: 0, tint: 0, shadows: -8, highlights: 15, lift: -0.01, gamma: 0.98, gain: 1.1 },
    tags: ['vibrant', 'pop', 'colorful', 'energetic'],
    difficulty: 'beginner',
    useCase: 'Pop music videos, energetic content',
  },
  {
    id: 'vhs_retro',
    name: 'VHS Retro',
    description: '1980s VHS aesthetic with magenta tint',
    category: 'music_video',
    thumbnail: 'vhs-retro',
    lut: 'VHS_RETRO_80S',
    settings: { contrast: 1.2, saturation: 0.9, temperature: 5, tint: 15, shadows: 10, highlights: -10, lift: 0.03, gamma: 1.05, gain: 0.95 },
    tags: ['vhs', 'retro', '80s', 'synthwave'],
    difficulty: 'beginner',
    useCase: 'Retro content, synthwave, 80s aesthetic',
  },
  {
    id: 'hip_hop_dark',
    name: 'Hip Hop Dark',
    description: 'High contrast dark look for urban content',
    category: 'music_video',
    thumbnail: 'moody-desat',
    lut: 'HIP_HOP_DARK_URBAN',
    settings: { contrast: 1.4, saturation: 0.8, temperature: -10, tint: 0, shadows: -25, highlights: 10, lift: 0.0, gamma: 0.9, gain: 1.05 },
    tags: ['hip-hop', 'urban', 'dark', 'contrast'],
    difficulty: 'intermediate',
    useCase: 'Hip hop videos, urban content, rap',
  },
  {
    id: 'edm_neon',
    name: 'EDM Neon',
    description: 'Electric colors for dance music videos',
    category: 'music_video',
    thumbnail: 'neon-nights',
    lut: 'EDM_ELECTRIC_NEON',
    settings: { contrast: 1.35, saturation: 1.5, temperature: -15, tint: 10, shadows: -20, highlights: 25, lift: -0.02, gamma: 0.92, gain: 1.2 },
    tags: ['edm', 'electric', 'neon', 'dance'],
    difficulty: 'intermediate',
    useCase: 'EDM videos, club content, festivals',
  },

  // === BROADCAST ===
  {
    id: 'clean_natural',
    name: 'Clean Natural',
    description: 'Neutral broadcast-safe grading',
    category: 'broadcast',
    thumbnail: 'clean-natural',
    lut: 'BROADCAST_NATURAL',
    settings: { contrast: 1.05, saturation: 1.0, temperature: 0, tint: 0, shadows: 0, highlights: 0, lift: 0.0, gamma: 1.0, gain: 1.0 },
    tags: ['natural', 'clean', 'broadcast', 'neutral'],
    difficulty: 'beginner',
    useCase: 'Corporate videos, news, documentaries',
  },
  {
    id: 'news_broadcast',
    name: 'News Broadcast',
    description: 'Slightly warm, professional news look',
    category: 'broadcast',
    thumbnail: 'clean-natural',
    lut: 'NEWS_BROADCAST_PRO',
    settings: { contrast: 1.08, saturation: 1.02, temperature: 3, tint: 0, shadows: 3, highlights: -2, lift: 0.01, gamma: 1.0, gain: 1.0 },
    tags: ['news', 'broadcast', 'professional', 'warm'],
    difficulty: 'beginner',
    useCase: 'News packages, interviews, corporate',
  },
  {
    id: 'instagram_fade',
    name: 'Instagram Fade',
    description: 'Lifted shadows, faded highlights - lifestyle',
    category: 'broadcast',
    thumbnail: 'instagram-fade',
    lut: 'INSTAGRAM_LIFESTYLE_FADE',
    settings: { contrast: 0.95, saturation: 0.9, temperature: 8, tint: 3, shadows: 20, highlights: -15, lift: 0.04, gamma: 1.08, gain: 0.92 },
    tags: ['instagram', 'lifestyle', 'faded', 'social'],
    difficulty: 'beginner',
    useCase: 'Social media, lifestyle content, vlogs',
  },

  // === DOCUMENTARY ===
  {
    id: 'documentary_natural',
    name: 'Documentary Natural',
    description: 'Clean naturalistic look for docs',
    category: 'documentary',
    thumbnail: 'clean-natural',
    lut: 'DOCUMENTARY_NATURAL_V2',
    settings: { contrast: 1.1, saturation: 0.95, temperature: 2, tint: 0, shadows: -5, highlights: 0, lift: 0.01, gamma: 1.0, gain: 1.0 },
    tags: ['documentary', 'natural', 'clean', 'authentic'],
    difficulty: 'beginner',
    useCase: 'Documentaries, interviews, real stories',
  },
  {
    id: 'war_documentary',
    name: 'War Documentary',
    description: 'Gritty desaturated for war docs',
    category: 'documentary',
    thumbnail: 'bleach-bypass',
    lut: 'WAR_DOCUMENTARY_GRITTY',
    settings: { contrast: 1.25, saturation: 0.6, temperature: -8, tint: 0, shadows: -15, highlights: 5, lift: 0.02, gamma: 0.95, gain: 0.98 },
    tags: ['war', 'documentary', 'gritty', 'historical'],
    difficulty: 'intermediate',
    useCase: 'War documentaries, historical pieces',
  },
  {
    id: 'nature_vivid',
    name: 'Nature Vivid',
    description: 'Enhanced colors for nature docs',
    category: 'documentary',
    thumbnail: 'fuji-velvia',
    lut: 'NATURE_VIVID_BBC',
    settings: { contrast: 1.12, saturation: 1.2, temperature: 0, tint: -2, shadows: -5, highlights: 5, lift: 0.0, gamma: 1.0, gain: 1.02 },
    tags: ['nature', 'vivid', 'wildlife', 'documentary'],
    difficulty: 'beginner',
    useCase: 'Nature docs, wildlife, Planet Earth style',
  },
];

// ============================================
// COMPREHENSIVE TRANSITIONS LIBRARY (50+)
// ============================================

export interface Transition {
  id: string;
  name: string;
  description: string;
  category: 'cut' | 'dissolve' | 'wipe' | 'zoom' | 'glitch' | 'creative' | 'motion' | 'light';
  duration: number; // frames at 24fps
  params: Record<string, number | string>;
  beatSync: boolean;
  intensity: 'subtle' | 'moderate' | 'intense';
}

export const TRANSITIONS_LIBRARY: Transition[] = [
  // === CUTS ===
  { id: 'hard_cut', name: 'Hard Cut', description: 'Instant cut with no effect', category: 'cut', duration: 0, params: {}, beatSync: true, intensity: 'subtle' },
  { id: 'flash_cut', name: 'Flash Cut', description: 'White flash between cuts', category: 'cut', duration: 6, params: { brightness: 2.5, falloff: 0.8 }, beatSync: true, intensity: 'intense' },
  { id: 'match_cut', name: 'Match Cut', description: 'Cut on similar shapes/motion', category: 'cut', duration: 0, params: { matchType: 'shape' }, beatSync: false, intensity: 'subtle' },
  { id: 'j_cut', name: 'J-Cut', description: 'Audio leads video transition', category: 'cut', duration: 24, params: { audioOffset: -12 }, beatSync: false, intensity: 'subtle' },
  { id: 'l_cut', name: 'L-Cut', description: 'Video leads audio transition', category: 'cut', duration: 24, params: { audioOffset: 12 }, beatSync: false, intensity: 'subtle' },
  { id: 'smash_cut', name: 'Smash Cut', description: 'Abrupt dramatic cut', category: 'cut', duration: 0, params: { audioHit: 'yes' }, beatSync: true, intensity: 'intense' },

  // === DISSOLVES ===
  { id: 'cross_dissolve', name: 'Cross Dissolve', description: 'Classic fade transition', category: 'dissolve', duration: 24, params: { curve: 'linear' }, beatSync: false, intensity: 'subtle' },
  { id: 'dip_to_black', name: 'Dip to Black', description: 'Fade out then in through black', category: 'dissolve', duration: 48, params: { holdFrames: 12 }, beatSync: false, intensity: 'moderate' },
  { id: 'dip_to_white', name: 'Dip to White', description: 'Fade through white', category: 'dissolve', duration: 48, params: { holdFrames: 12 }, beatSync: false, intensity: 'moderate' },
  { id: 'additive_dissolve', name: 'Additive Dissolve', description: 'Bright additive blend', category: 'dissolve', duration: 24, params: { blendMode: 'add' }, beatSync: false, intensity: 'moderate' },
  { id: 'film_dissolve', name: 'Film Dissolve', description: 'Classic film-style dissolve', category: 'dissolve', duration: 36, params: { curve: 'film' }, beatSync: false, intensity: 'subtle' },

  // === WIPES ===
  { id: 'wipe_left', name: 'Wipe Left', description: 'Horizontal wipe left', category: 'wipe', duration: 18, params: { direction: 'left', feather: 0.05 }, beatSync: true, intensity: 'moderate' },
  { id: 'wipe_right', name: 'Wipe Right', description: 'Horizontal wipe right', category: 'wipe', duration: 18, params: { direction: 'right', feather: 0.05 }, beatSync: true, intensity: 'moderate' },
  { id: 'wipe_up', name: 'Wipe Up', description: 'Vertical wipe up', category: 'wipe', duration: 18, params: { direction: 'up', feather: 0.05 }, beatSync: true, intensity: 'moderate' },
  { id: 'wipe_down', name: 'Wipe Down', description: 'Vertical wipe down', category: 'wipe', duration: 18, params: { direction: 'down', feather: 0.05 }, beatSync: true, intensity: 'moderate' },
  { id: 'iris_wipe', name: 'Iris Wipe', description: 'Circular iris wipe', category: 'wipe', duration: 24, params: { shape: 'circle', feather: 0.1 }, beatSync: false, intensity: 'moderate' },
  { id: 'star_wipe', name: 'Star Wipe', description: 'Star-shaped wipe', category: 'wipe', duration: 24, params: { shape: 'star', points: 5 }, beatSync: false, intensity: 'intense' },
  { id: 'clock_wipe', name: 'Clock Wipe', description: 'Radial clock wipe', category: 'wipe', duration: 24, params: { direction: 'cw' }, beatSync: true, intensity: 'moderate' },

  // === ZOOM TRANSITIONS ===
  { id: 'zoom_in', name: 'Zoom In', description: 'Zoom into next clip', category: 'zoom', duration: 12, params: { scale: 1.5, blur: 0.2 }, beatSync: true, intensity: 'intense' },
  { id: 'zoom_out', name: 'Zoom Out', description: 'Zoom out to next clip', category: 'zoom', duration: 12, params: { scale: 0.5, blur: 0.2 }, beatSync: true, intensity: 'intense' },
  { id: 'zoom_blur', name: 'Zoom Blur', description: 'Zoom with motion blur', category: 'zoom', duration: 8, params: { scale: 2.0, blur: 0.5 }, beatSync: true, intensity: 'intense' },
  { id: 'dolly_zoom', name: 'Dolly Zoom', description: 'Vertigo effect transition', category: 'zoom', duration: 36, params: { fov: 1.5, push: -0.5 }, beatSync: false, intensity: 'intense' },
  { id: 'zoom_rotate', name: 'Zoom Rotate', description: 'Zoom with rotation', category: 'zoom', duration: 12, params: { scale: 1.5, rotation: 180 }, beatSync: true, intensity: 'intense' },

  // === GLITCH TRANSITIONS ===
  { id: 'glitch_cut', name: 'Glitch Cut', description: 'Digital glitch distortion', category: 'glitch', duration: 6, params: { intensity: 0.8, frequency: 30 }, beatSync: true, intensity: 'intense' },
  { id: 'rgb_split', name: 'RGB Split', description: 'Color channel separation', category: 'glitch', duration: 8, params: { offset: 20, angle: 45 }, beatSync: true, intensity: 'intense' },
  { id: 'data_mosh', name: 'Data Mosh', description: 'Corrupted video effect', category: 'glitch', duration: 12, params: { blocks: 0.3, trails: 0.5 }, beatSync: true, intensity: 'intense' },
  { id: 'vhs_glitch', name: 'VHS Glitch', description: 'Analog VHS tracking error', category: 'glitch', duration: 10, params: { tracking: 0.5, noise: 0.3 }, beatSync: true, intensity: 'moderate' },
  { id: 'digital_noise', name: 'Digital Noise', description: 'Digital static burst', category: 'glitch', duration: 6, params: { density: 0.6 }, beatSync: true, intensity: 'moderate' },
  { id: 'scan_lines', name: 'Scan Lines', description: 'CRT scan line effect', category: 'glitch', duration: 8, params: { lines: 100, flicker: 0.3 }, beatSync: false, intensity: 'subtle' },

  // === CREATIVE TRANSITIONS ===
  { id: 'morph_cut', name: 'Morph Cut', description: 'AI-assisted seamless cut', category: 'creative', duration: 18, params: { morphStrength: 0.8 }, beatSync: false, intensity: 'subtle' },
  { id: 'ink_drop', name: 'Ink Drop', description: 'Organic ink spreading', category: 'creative', duration: 36, params: { spread: 1.2 }, beatSync: false, intensity: 'moderate' },
  { id: 'paint_brush', name: 'Paint Brush', description: 'Brush stroke reveal', category: 'creative', duration: 30, params: { strokes: 5 }, beatSync: false, intensity: 'moderate' },
  { id: 'shatter', name: 'Shatter', description: 'Glass shatter effect', category: 'creative', duration: 18, params: { pieces: 50, force: 1.5 }, beatSync: true, intensity: 'intense' },
  { id: 'liquid_warp', name: 'Liquid Warp', description: 'Fluid liquid distortion', category: 'creative', duration: 24, params: { viscosity: 0.5 }, beatSync: false, intensity: 'moderate' },
  { id: 'pixel_sort', name: 'Pixel Sort', description: 'Artistic pixel sorting', category: 'creative', duration: 18, params: { threshold: 0.5, direction: 'horizontal' }, beatSync: true, intensity: 'intense' },
  { id: 'kaleidoscope', name: 'Kaleidoscope', description: 'Kaleidoscope mirror effect', category: 'creative', duration: 24, params: { segments: 8 }, beatSync: true, intensity: 'intense' },

  // === MOTION TRANSITIONS ===
  { id: 'whip_pan', name: 'Whip Pan', description: 'Fast horizontal blur', category: 'motion', duration: 8, params: { blur: 0.8, direction: 'horizontal' }, beatSync: true, intensity: 'intense' },
  { id: 'whip_tilt', name: 'Whip Tilt', description: 'Fast vertical blur', category: 'motion', duration: 8, params: { blur: 0.8, direction: 'vertical' }, beatSync: true, intensity: 'intense' },
  { id: 'spin_transition', name: 'Spin', description: '360 degree rotation', category: 'motion', duration: 12, params: { rotations: 1, blur: 0.3 }, beatSync: true, intensity: 'intense' },
  { id: 'slide_push', name: 'Slide Push', description: 'Push slide between clips', category: 'motion', duration: 18, params: { direction: 'left' }, beatSync: true, intensity: 'moderate' },
  { id: 'cube_spin', name: 'Cube Spin', description: '3D cube rotation', category: 'motion', duration: 24, params: { axis: 'y' }, beatSync: false, intensity: 'moderate' },
  { id: 'flip_over', name: 'Flip Over', description: '3D page flip', category: 'motion', duration: 24, params: { axis: 'x' }, beatSync: false, intensity: 'moderate' },

  // === LIGHT TRANSITIONS ===
  { id: 'light_leak', name: 'Light Leak', description: 'Organic light leak overlay', category: 'light', duration: 24, params: { color: 'orange', intensity: 0.8 }, beatSync: false, intensity: 'moderate' },
  { id: 'film_burn', name: 'Film Burn', description: 'Analog film burn effect', category: 'light', duration: 18, params: { color: 'red', speed: 1.2 }, beatSync: false, intensity: 'moderate' },
  { id: 'lens_flare', name: 'Lens Flare', description: 'Anamorphic flare sweep', category: 'light', duration: 24, params: { intensity: 1.5, color: 'blue' }, beatSync: false, intensity: 'moderate' },
  { id: 'bokeh_blur', name: 'Bokeh Blur', description: 'Soft bokeh transition', category: 'light', duration: 30, params: { blurAmount: 0.6, shape: 'circle' }, beatSync: false, intensity: 'subtle' },
  { id: 'prism', name: 'Prism', description: 'Rainbow prism refraction', category: 'light', duration: 18, params: { spread: 30 }, beatSync: false, intensity: 'moderate' },
];

// ============================================
// MOTION EFFECTS LIBRARY (30+)
// ============================================

export interface MotionEffect {
  id: string;
  name: string;
  description: string;
  category: 'zoom' | 'shake' | 'speed' | 'stabilize' | 'lens' | 'film' | 'color_fx';
  params: Record<string, number | string | boolean>;
  beatSync: boolean;
  intensity: 'subtle' | 'moderate' | 'intense';
  useCase: string;
}

export const MOTION_EFFECTS: MotionEffect[] = [
  // === ZOOM EFFECTS ===
  { id: 'zoom_pulse', name: 'Zoom Pulse', description: 'Rhythmic zoom in/out', category: 'zoom', params: { amount: 1.05, timing: 'beat' }, beatSync: true, intensity: 'moderate', useCase: 'Music videos, energy moments' },
  { id: 'smooth_zoom', name: 'Smooth Zoom', description: 'Gradual cinematic zoom', category: 'zoom', params: { amount: 1.15, duration: 120 }, beatSync: false, intensity: 'subtle', useCase: 'Cinematic reveals' },
  { id: 'ken_burns', name: 'Ken Burns', description: 'Pan and zoom for stills', category: 'zoom', params: { scale: 1.2, pan: 0.1 }, beatSync: false, intensity: 'subtle', useCase: 'Photo slideshows' },
  { id: 'elastic_zoom', name: 'Elastic Zoom', description: 'Bouncy elastic zoom', category: 'zoom', params: { amount: 1.3, bounce: 0.3 }, beatSync: true, intensity: 'intense', useCase: 'Energetic content' },
  { id: 'dolly_zoom', name: 'Dolly Zoom', description: 'Vertigo push-pull effect', category: 'zoom', params: { fov: 1.5, push: -0.5 }, beatSync: false, intensity: 'intense', useCase: 'Dramatic reveals' },

  // === SHAKE EFFECTS ===
  { id: 'camera_shake', name: 'Camera Shake', description: 'Handheld shake simulation', category: 'shake', params: { amount: 5, frequency: 24 }, beatSync: false, intensity: 'moderate', useCase: 'Documentary, action' },
  { id: 'impact_shake', name: 'Impact Shake', description: 'Single impact shake', category: 'shake', params: { amount: 15, decay: 0.8 }, beatSync: true, intensity: 'intense', useCase: 'Explosions, hits' },
  { id: 'bass_shake', name: 'Bass Shake', description: 'Low-frequency shake', category: 'shake', params: { amount: 8, frequency: 8 }, beatSync: true, intensity: 'moderate', useCase: 'Bass drops, impacts' },
  { id: 'earthquake', name: 'Earthquake', description: 'Intense seismic shake', category: 'shake', params: { amount: 25, chaos: 0.5 }, beatSync: false, intensity: 'intense', useCase: 'Disaster scenes' },

  // === SPEED EFFECTS ===
  { id: 'speed_ramp', name: 'Speed Ramp', description: 'Variable speed transition', category: 'speed', params: { slowSpeed: 0.25, fastSpeed: 2.0 }, beatSync: true, intensity: 'intense', useCase: 'Action, sports' },
  { id: 'smooth_slow_mo', name: 'Smooth Slow-Mo', description: 'AI-interpolated slow motion', category: 'speed', params: { speed: 0.25, interpolation: 'optical' }, beatSync: false, intensity: 'moderate', useCase: 'Dramatic moments' },
  { id: 'time_freeze', name: 'Time Freeze', description: 'Freeze frame effect', category: 'speed', params: { holdDuration: '48' }, beatSync: true, intensity: 'moderate', useCase: 'Emphasis, reveals' },
  { id: 'reverse', name: 'Reverse', description: 'Reverse playback', category: 'speed', params: { speed: -1.0 }, beatSync: false, intensity: 'moderate', useCase: 'Creative rewinds' },
  { id: 'strobe', name: 'Strobe', description: 'Strobing frame skip', category: 'speed', params: { frequency: 4 }, beatSync: true, intensity: 'intense', useCase: 'Club scenes, energy' },

  // === STABILIZE EFFECTS ===
  { id: 'warp_stabilizer', name: 'Warp Stabilizer', description: 'Advanced stabilization', category: 'stabilize', params: { smoothness: 50, crop: 'auto' }, beatSync: false, intensity: 'subtle', useCase: 'Shaky footage' },
  { id: 'tripod_lock', name: 'Tripod Lock', description: 'Rock-solid stabilization', category: 'stabilize', params: { smoothness: 100, motion: 'position' }, beatSync: false, intensity: 'subtle', useCase: 'Interview, talking head' },

  // === LENS EFFECTS ===
  { id: 'lens_flare', name: 'Lens Flare', description: 'Anamorphic lens flare', category: 'lens', params: { intensity: 1.0, color: 'blue', streaks: 6 }, beatSync: false, intensity: 'moderate', useCase: 'Cinematic style' },
  { id: 'light_bloom', name: 'Light Bloom', description: 'Soft highlight glow', category: 'lens', params: { threshold: 0.8, amount: 0.3 }, beatSync: false, intensity: 'subtle', useCase: 'Dreamy, romantic' },
  { id: 'chromatic_aberration', name: 'Chromatic Aberration', description: 'Color fringing effect', category: 'lens', params: { amount: 5, falloff: 'edge' }, beatSync: false, intensity: 'subtle', useCase: 'Vintage, stylized' },
  { id: 'vignette', name: 'Vignette', description: 'Edge darkening', category: 'lens', params: { amount: 0.5, midpoint: 50, feather: 50 }, beatSync: false, intensity: 'subtle', useCase: 'Cinematic focus' },
  { id: 'barrel_distortion', name: 'Barrel Distortion', description: 'Wide lens distortion', category: 'lens', params: { amount: 0.15 }, beatSync: false, intensity: 'subtle', useCase: 'GoPro style' },
  { id: 'anamorphic_bokeh', name: 'Anamorphic Bokeh', description: 'Oval bokeh simulation', category: 'lens', params: { squeeze: 1.33, blur: 0.5 }, beatSync: false, intensity: 'moderate', useCase: 'Cinematic depth' },

  // === FILM EFFECTS ===
  { id: 'film_grain', name: 'Film Grain', description: 'Organic film grain', category: 'film', params: { amount: 0.3, size: 1.5, softness: 0.5 }, beatSync: false, intensity: 'subtle', useCase: 'Vintage, cinematic' },
  { id: 'halation', name: 'Halation', description: 'Film halation glow', category: 'film', params: { amount: 0.2, threshold: 0.7, color: 'red' }, beatSync: false, intensity: 'subtle', useCase: 'Retro film look' },
  { id: 'film_damage', name: 'Film Damage', description: 'Scratches and dust', category: 'film', params: { scratches: 0.3, dust: 0.2, flicker: 0.1 }, beatSync: false, intensity: 'moderate', useCase: 'Vintage, distressed' },
  { id: 'vhs_tracking', name: 'VHS Tracking', description: 'VHS tracking errors', category: 'film', params: { amount: 0.3, noise: 0.2 }, beatSync: false, intensity: 'moderate', useCase: 'Retro, nostalgia' },
  { id: 'scanlines', name: 'Scanlines', description: 'CRT scanlines', category: 'film', params: { density: 100, opacity: 0.3 }, beatSync: false, intensity: 'subtle', useCase: 'Retro, gaming' },

  // === COLOR FX ===
  { id: 'rgb_split', name: 'RGB Split', description: 'Color channel offset', category: 'color_fx', params: { amount: 10, angle: 0 }, beatSync: true, intensity: 'intense', useCase: 'Glitch, energy' },
  { id: 'posterize', name: 'Posterize', description: 'Reduce color levels', category: 'color_fx', params: { levels: 8 }, beatSync: false, intensity: 'moderate', useCase: 'Stylized, artistic' },
  { id: 'duotone', name: 'Duotone', description: 'Two-color toning', category: 'color_fx', params: { highlights: '#ff6b6b', shadows: '#4ecdc4' }, beatSync: false, intensity: 'moderate', useCase: 'Stylized, graphic' },
];

// ============================================
// ADVANCED SETTINGS TYPES
// ============================================

export interface AdvancedSettings {
  // Sharpening
  sharpening: {
    enabled: boolean;
    amount: number;      // 0-100
    radius: number;      // 0.5-3
    threshold: number;   // 0-255
  };
  // Noise Reduction
  noiseReduction: {
    enabled: boolean;
    luminance: number;   // 0-100
    color: number;       // 0-100
    detail: number;      // 0-100
  };
  // Lens Effects
  lensEffects: {
    chromaticAberration: number;  // 0-100
    distortion: number;           // -100 to 100
    vignette: {
      amount: number;
      midpoint: number;
      feather: number;
    };
  };
  // Film Emulation
  filmEmulation: {
    grain: {
      enabled: boolean;
      amount: number;
      size: number;
    };
    halation: {
      enabled: boolean;
      amount: number;
      threshold: number;
    };
    filmDamage: {
      enabled: boolean;
      scratches: number;
      dust: number;
      flicker: number;
    };
  };
  // Output Settings
  output: {
    deinterlace: boolean;
    fieldOrder: 'upper' | 'lower' | 'progressive';
    colorSpace: 'rec709' | 'rec2020' | 'dcip3' | 'srgb';
    bitDepth: 8 | 10 | 12;
    lumetriScope: boolean;
  };
}

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  sharpening: {
    enabled: false,
    amount: 50,
    radius: 1.0,
    threshold: 4,
  },
  noiseReduction: {
    enabled: false,
    luminance: 25,
    color: 25,
    detail: 50,
  },
  lensEffects: {
    chromaticAberration: 0,
    distortion: 0,
    vignette: {
      amount: 0,
      midpoint: 50,
      feather: 50,
    },
  },
  filmEmulation: {
    grain: {
      enabled: false,
      amount: 15,
      size: 1.5,
    },
    halation: {
      enabled: false,
      amount: 10,
      threshold: 80,
    },
    filmDamage: {
      enabled: false,
      scratches: 5,
      dust: 10,
      flicker: 5,
    },
  },
  output: {
    deinterlace: false,
    fieldOrder: 'progressive',
    colorSpace: 'rec709',
    bitDepth: 10,
    lumetriScope: true,
  },
};

// ============================================
// EFFECT PRESETS (Extended)
// ============================================

export interface ExtendedEffectPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  transitions: string[];
  motionEffects: string[];
  intensity: 'subtle' | 'moderate' | 'intense';
  genre: string;
  beatSyncEnabled: boolean;
  recommended: {
    luts: string[];
    styles: string[];
  };
}

export const EXTENDED_EFFECT_PRESETS: ExtendedEffectPreset[] = [
  {
    id: 'hype_mode',
    name: 'Hype Mode',
    description: 'Maximum energy with glitches, zooms, and speed ramps',
    icon: 'zap',
    transitions: ['glitch_cut', 'zoom_in', 'whip_pan', 'flash_cut', 'rgb_split', 'smash_cut'],
    motionEffects: ['zoom_pulse', 'camera_shake', 'speed_ramp', 'rgb_split', 'strobe'],
    intensity: 'intense',
    genre: 'Music Video, Hype',
    beatSyncEnabled: true,
    recommended: { luts: ['vibrant_pop', 'neon_nights'], styles: ['music_video_hype'] },
  },
  {
    id: 'cinematic_mode',
    name: 'Cinematic Mode',
    description: 'Elegant film-style transitions with subtle motion',
    icon: 'film',
    transitions: ['cross_dissolve', 'dip_to_black', 'match_cut', 'l_cut', 'j_cut', 'film_dissolve'],
    motionEffects: ['smooth_zoom', 'light_bloom', 'lens_flare', 'film_grain', 'vignette'],
    intensity: 'subtle',
    genre: 'Film, Drama',
    beatSyncEnabled: false,
    recommended: { luts: ['teal_orange', 'moody_desat', 'kodak_gold'], styles: ['cinematic'] },
  },
  {
    id: 'clean_mode',
    name: 'Clean Mode',
    description: 'Minimal professional transitions for corporate',
    icon: 'minimize',
    transitions: ['hard_cut', 'cross_dissolve', 'dip_to_black'],
    motionEffects: ['warp_stabilizer', 'vignette'],
    intensity: 'subtle',
    genre: 'Corporate, Broadcast',
    beatSyncEnabled: false,
    recommended: { luts: ['clean_natural', 'news_broadcast'], styles: ['commercial_clean'] },
  },
  {
    id: 'retro_mode',
    name: 'Retro Mode',
    description: 'VHS and analog-inspired nostalgic effects',
    icon: 'clock',
    transitions: ['vhs_glitch', 'film_burn', 'light_leak', 'scan_lines'],
    motionEffects: ['film_grain', 'vhs_tracking', 'chromatic_aberration', 'scanlines', 'film_damage'],
    intensity: 'moderate',
    genre: 'Retro, Nostalgic',
    beatSyncEnabled: false,
    recommended: { luts: ['vhs_retro', 'vintage_film', 'polaroid_fade'], styles: ['cinematic'] },
  },
  {
    id: 'dynamic_mode',
    name: 'Dynamic Mode',
    description: 'Motion-heavy action style with speed ramps',
    icon: 'activity',
    transitions: ['whip_pan', 'spin_transition', 'slide_push', 'zoom_blur', 'cube_spin'],
    motionEffects: ['camera_shake', 'speed_ramp', 'elastic_zoom', 'impact_shake'],
    intensity: 'intense',
    genre: 'Action, Sports',
    beatSyncEnabled: true,
    recommended: { luts: ['blockbuster_action', 'bleach_bypass'], styles: ['cinematic'] },
  },
  {
    id: 'dreamy_mode',
    name: 'Dreamy Mode',
    description: 'Soft ethereal transitions for romantic content',
    icon: 'heart',
    transitions: ['cross_dissolve', 'bokeh_blur', 'light_leak', 'film_dissolve'],
    motionEffects: ['light_bloom', 'smooth_zoom', 'vignette', 'halation'],
    intensity: 'subtle',
    genre: 'Wedding, Romance',
    beatSyncEnabled: false,
    recommended: { luts: ['dreamy_wedding', 'romance_soft', 'golden_hour'], styles: ['cinematic'] },
  },
  {
    id: 'cyberpunk_mode',
    name: 'Cyberpunk Mode',
    description: 'Neon glitches and futuristic effects',
    icon: 'cpu',
    transitions: ['glitch_cut', 'rgb_split', 'data_mosh', 'digital_noise', 'zoom_blur'],
    motionEffects: ['rgb_split', 'chromatic_aberration', 'scanlines', 'zoom_pulse'],
    intensity: 'intense',
    genre: 'Sci-Fi, Futuristic',
    beatSyncEnabled: true,
    recommended: { luts: ['cyberpunk_city', 'neon_nights', 'scifi_green'], styles: ['music_video_hype'] },
  },
  {
    id: 'documentary_mode',
    name: 'Documentary Mode',
    description: 'Clean authentic cuts for factual content',
    icon: 'book-open',
    transitions: ['hard_cut', 'cross_dissolve', 'j_cut', 'l_cut'],
    motionEffects: ['warp_stabilizer', 'ken_burns'],
    intensity: 'subtle',
    genre: 'Documentary',
    beatSyncEnabled: false,
    recommended: { luts: ['documentary_natural', 'clean_natural'], styles: ['commercial_clean'] },
  },
  {
    id: 'artistic_mode',
    name: 'Artistic Mode',
    description: 'Creative experimental effects',
    icon: 'palette',
    transitions: ['ink_drop', 'paint_brush', 'liquid_warp', 'pixel_sort', 'kaleidoscope'],
    motionEffects: ['posterize', 'duotone', 'chromatic_aberration'],
    intensity: 'intense',
    genre: 'Art, Experimental',
    beatSyncEnabled: false,
    recommended: { luts: ['chiaroscuro', 'bw_classic'], styles: ['cinematic'] },
  },
  {
    id: 'horror_mode',
    name: 'Horror Mode',
    description: 'Dark unsettling effects for horror content',
    icon: 'skull',
    transitions: ['flash_cut', 'glitch_cut', 'dip_to_black', 'smash_cut'],
    motionEffects: ['camera_shake', 'chromatic_aberration', 'film_damage', 'vignette'],
    intensity: 'intense',
    genre: 'Horror, Thriller',
    beatSyncEnabled: false,
    recommended: { luts: ['horror_teal', 'thriller_cold', 'bleach_bypass'], styles: ['cinematic'] },
  },
];
