 // ============================================
 // AKEEF STUDIO AI - Advanced Editing Presets
 // ============================================
 
 export interface EditPreset {
   id: string;
   name: string;
   description: string;
   icon: string;
   category: 'style' | 'version';
   defaultRules: string;
 }
 
 export interface ColorGrade {
   id: string;
   name: string;
   description: string;
   lut: string;
   settings: {
     contrast: number;
     saturation: number;
     temperature: number;
     tint: number;
     shadows: number;
     highlights: number;
   };
 }
 
 export interface EffectPreset {
   id: string;
   name: string;
   description: string;
   transitions: string[];
   motionEffects: string[];
   intensity: 'subtle' | 'moderate' | 'intense';
 }
 
 export interface GraphicsTemplate {
   id: string;
   name: string;
   description: string;
   type: 'title' | 'lower_third' | 'caption' | 'opener' | 'end_card';
   style: string;
   animation: string;
 }
 
 export interface VersionType {
   id: string;
   name: string;
   description: string;
   duration: string;
   aspectRatio: string;
   platform: string;
 }
 
 export interface ExportFormat {
   id: string;
   name: string;
   extension: string;
   codec: string;
   resolution: string;
   bitrate: string;
 }
 
 // ============================================
 // STYLE PRESETS
 // ============================================
 
 export const STYLE_PRESETS: EditPreset[] = [
   {
     id: 'cinematic',
     name: 'Cinematic',
     description: 'Film-grade aesthetic with dramatic pacing',
     icon: 'film',
     category: 'style',
     defaultRules: `STYLE: Cinematic Film Grade
 
 COLOR GRADING:
 - Apply cinematic LUT with teal/orange color science
 - Crush blacks slightly for film look
 - Add subtle film grain (2-3%)
 - Desaturate slightly for muted tones
 - Add letterboxing (2.39:1 aspect ratio)
 
 PACING:
 - Slow, deliberate cuts (3-6 seconds average)
 - Use dissolves for time passage
 - Hold on establishing shots 4-5 seconds
 - Build tension through extended takes
 - Use L-cuts and J-cuts for dialogue
 
 EFFECTS:
 - Subtle lens flares on light sources
 - Light bloom on highlights
 - Vignette edges (15-20%)
 - Gentle film weave/stabilization
 - Atmospheric haze in wide shots
 
 TRANSITIONS:
 - Cross dissolves for scene changes
 - Dip to black for major transitions
 - Match cuts on action
 - Avoid flashy transitions`,
   },
   {
     id: 'music_video_hype',
     name: 'Music Video Hype',
     description: 'High-energy beat-synced edits with visual punch',
     icon: 'music',
     category: 'style',
     defaultRules: `STYLE: Music Video Maximum Energy
 
 COLOR GRADING:
 - High contrast, punchy colors
 - Saturated primaries (especially reds/blues)
 - Apply stylized LUT per song section
 - Verse: muted/moody tones
 - Chorus: vibrant/explosive colors
 - Bridge: desaturated/artistic
 
 BEAT SYNC:
 - Cut on EVERY major beat during chorus
 - Hold shots on verses (2-4 beats)
 - Triplet cuts on hi-hats for energy
 - Sync zoom/motion to bass hits
 - Flash frames on snare accents
 
 EFFECTS:
 - Speed ramps (60% slow → 150% fast)
 - Zoom pulses on beat drops
 - Glitch effects on transitions
 - RGB split on energy peaks
 - Light leaks between sections
 
 MOTION:
 - Ken Burns on static shots
 - Whip pans between angles
 - Handheld shake during energy
 - Smooth stabilization on emotional moments`,
   },
   {
     id: 'social_tiktok',
     name: 'Social / TikTok',
     description: 'Ultra-fast viral-ready edits for social platforms',
     icon: 'smartphone',
     category: 'style',
     defaultRules: `STYLE: TikTok/Reels Viral Format
 
 FORMAT:
 - 9:16 vertical aspect ratio
 - Maximum 60 seconds duration
 - Hook in first 0.5 seconds
 - Text overlays for accessibility
 
 PACING:
 - Maximum cut length: 1 second
 - Average cut: 0.3-0.5 seconds
 - Never hold static beyond 0.5s
 - Cut on every motion peak
 
 EFFECTS:
 - Zoom cuts (105% punch-in)
 - Speed ramps (0.5x → 2x)
 - Text pop animations
 - Trending sound sync
 - Reaction zooms on faces
 
 GRAPHICS:
 - Bold text overlays
 - Emoji reactions
 - Progress bars
 - Captions (always on)
 - CTA at end
 
 COLOR:
 - High saturation
 - Bright, eye-catching
 - Trending filter looks`,
   },
   {
     id: 'commercial_clean',
     name: 'Commercial / Clean',
     description: 'Polished professional brand-safe content',
     icon: 'briefcase',
     category: 'style',
     defaultRules: `STYLE: Commercial Broadcast Quality
 
 COLOR GRADING:
 - Clean, neutral color balance
 - Slightly lifted shadows (broadcast safe)
 - Consistent skin tones
 - Brand color enhancement
 - Legal color levels (16-235)
 
 PACING:
 - Measured, professional cuts (2-4 seconds)
 - Clear narrative flow
 - Product hero shots held longer
 - Call-to-action endings
 
 GRAPHICS:
 - Clean lower thirds
 - Professional title cards
 - Brand logo placement
 - Legal disclaimers positioned correctly
 - End card with CTA
 
 AUDIO:
 - Clean dialogue priority
 - Music bed under VO
 - Sound design accents
 - Proper audio levels (-12dB dialogue)
 
 TRANSITIONS:
 - Simple cuts preferred
 - Occasional dissolves
 - No flashy effects
 - Match action cuts`,
   },
   {
     id: 'concert_multicam',
     name: 'Concert Multi-Cam',
     description: 'Live performance switching with crowd energy',
     icon: 'video',
     category: 'style',
     defaultRules: `STYLE: Live Concert Professional
 
 CAMERA SWITCHING:
 - Switch every 2-4 bars (8-16 beats)
 - Cut on musical phrase changes
 - Hold hero shots during vocal hooks
 - Quick switches during solos
 
 CAMERA PRIORITY:
 1. Lead performer close-up (40%)
 2. Wide stage shots (25%)
 3. Instrument close-ups (15%)
 4. Crowd reactions (10%)
 5. Atmospheric/lighting shots (10%)
 
 COLOR GRADING:
 - Match stage lighting color
 - Enhance concert atmosphere
 - Preserve LED/lighting effects
 - Add subtle glow to lights
 
 ENERGY MATCHING:
 - Ballads: longer holds, slow switches
 - Rock/Pop: quick 2-bar switches
 - Builds: accelerate toward drops
 - Breakdowns: hold dramatic shots`,
   },
 ];
 
 // ============================================
 // VERSION TYPES (Output Variations)
 // ============================================
 
 export const VERSION_TYPES: VersionType[] = [
   {
     id: 'rough_cut',
     name: 'Rough Cut',
     description: 'Full-length assembly for review',
     duration: 'Full',
     aspectRatio: '16:9',
     platform: 'Review',
   },
   {
     id: 'montage',
     name: 'Montage Cut',
     description: 'Highlight compilation with music focus',
     duration: '60-90s',
     aspectRatio: '16:9',
     platform: 'YouTube',
   },
   {
     id: 'social_edit',
     name: 'Social Edit',
     description: 'Vertical format for TikTok/Reels/Shorts',
     duration: '30-60s',
     aspectRatio: '9:16',
     platform: 'TikTok/Reels',
   },
   {
     id: 'highlight',
     name: 'Highlight Reel',
     description: 'Best moments compilation',
     duration: '30-45s',
     aspectRatio: '16:9',
     platform: 'All',
   },
   {
     id: 'teaser',
     name: 'Teaser/Trailer',
     description: 'Promotional preview cut',
     duration: '15-30s',
     aspectRatio: '16:9',
     platform: 'Ads',
   },
 ];
 
 // ============================================
 // COLOR GRADING PRESETS
 // ============================================
 
export interface CinematicLUT {
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
}

export const CINEMATIC_LUTS: CinematicLUT[] = [
  // Hollywood Blockbuster LUTs
  {
    id: 'teal_orange',
    name: 'Teal & Orange',
    description: 'The iconic Hollywood blockbuster look - used in Transformers, Mad Max, countless action films',
    category: 'hollywood',
    thumbnail: 'teal-orange',
    lut: 'ARRI_TEAL_ORANGE_33',
    settings: { contrast: 1.2, saturation: 0.95, temperature: -8, tint: 0, shadows: -12, highlights: 8, lift: -0.02, gamma: 1.0, gain: 1.05 },
    tags: ['action', 'blockbuster', 'summer', 'warm'],
  },
  {
    id: 'blockbuster_action',
    name: 'Blockbuster Action',
    description: 'High-contrast dramatic sky look - Michael Bay style action sequences',
    category: 'hollywood',
    thumbnail: 'blockbuster',
    lut: 'HOLLYWOOD_BLOCKBUSTER_V2',
    settings: { contrast: 1.35, saturation: 1.1, temperature: -5, tint: 0, shadows: -15, highlights: 12, lift: -0.03, gamma: 0.98, gain: 1.1 },
    tags: ['action', 'dramatic', 'explosion', 'summer'],
  },
  {
    id: 'thriller_cold',
    name: 'Thriller Cold',
    description: 'Desaturated cold blue tones - perfect for suspense and thriller films like Fincher movies',
    category: 'hollywood',
    thumbnail: 'thriller-cold',
    lut: 'THRILLER_BLUE_STEEL',
    settings: { contrast: 1.25, saturation: 0.7, temperature: -20, tint: -5, shadows: -18, highlights: 0, lift: 0.01, gamma: 0.95, gain: 0.98 },
    tags: ['thriller', 'suspense', 'cold', 'dark'],
  },
  {
    id: 'moody_desat',
    name: 'Moody Desaturated',
    description: 'Dark atmospheric low-saturation look - Game of Thrones, The Revenant style',
    category: 'hollywood',
    thumbnail: 'moody-desat',
    lut: 'MOODY_DESAT_PRO',
    settings: { contrast: 1.3, saturation: 0.55, temperature: -12, tint: 0, shadows: -20, highlights: -5, lift: 0.02, gamma: 0.92, gain: 0.95 },
    tags: ['moody', 'dark', 'atmospheric', 'cinematic'],
  },
  // Film Stock Emulations
  {
    id: 'kodak_gold',
    name: 'Kodak Gold 200',
    description: 'Classic Kodak film warmth - nostalgic golden hour tones, legendary film stock',
    category: 'film_stock',
    thumbnail: 'kodak-gold',
    lut: 'KODAK_GOLD_200_EMU',
    settings: { contrast: 1.1, saturation: 1.05, temperature: 15, tint: 5, shadows: 5, highlights: -3, lift: 0.01, gamma: 1.02, gain: 1.02 },
    tags: ['film', 'warm', 'nostalgic', 'golden'],
  },
  {
    id: 'fuji_velvia',
    name: 'Fuji Velvia 50',
    description: 'Vivid greens and rich blues - legendary landscape film stock emulation',
    category: 'film_stock',
    thumbnail: 'fuji-velvia',
    lut: 'FUJI_VELVIA_50_EMU',
    settings: { contrast: 1.15, saturation: 1.25, temperature: -5, tint: -3, shadows: -5, highlights: 5, lift: -0.01, gamma: 1.0, gain: 1.05 },
    tags: ['film', 'vivid', 'landscape', 'nature'],
  },
  {
    id: 'vintage_film',
    name: 'Vintage 35mm',
    description: 'Warm sepia-toned analog film - classic 1970s cinema aesthetic',
    category: 'film_stock',
    thumbnail: 'vintage-film',
    lut: 'VINTAGE_35MM_WARM',
    settings: { contrast: 1.1, saturation: 0.85, temperature: 12, tint: 8, shadows: 8, highlights: -8, lift: 0.02, gamma: 1.03, gain: 0.98 },
    tags: ['vintage', 'retro', 'warm', 'nostalgic'],
  },
  {
    id: 'bw_classic',
    name: 'Classic B&W',
    description: 'High contrast black and white - timeless monochrome film noir style',
    category: 'film_stock',
    thumbnail: 'bw-classic',
    lut: 'BW_CLASSIC_NOIR',
    settings: { contrast: 1.4, saturation: 0.0, temperature: 0, tint: 0, shadows: -15, highlights: 10, lift: 0.0, gamma: 0.95, gain: 1.1 },
    tags: ['bw', 'noir', 'classic', 'dramatic'],
  },
  // Stylized LUTs
  {
    id: 'neon_nights',
    name: 'Neon Nights',
    description: 'Cyberpunk purple and cyan - Blade Runner, neon city aesthetic',
    category: 'stylized',
    thumbnail: 'neon-nights',
    lut: 'NEON_CYBERPUNK_V3',
    settings: { contrast: 1.4, saturation: 1.3, temperature: -18, tint: 15, shadows: -25, highlights: 18, lift: -0.02, gamma: 0.9, gain: 1.15 },
    tags: ['neon', 'cyberpunk', 'night', 'futuristic'],
  },
  {
    id: 'scifi_green',
    name: 'Sci-Fi Green',
    description: 'Matrix-inspired green tint - digital technology aesthetic',
    category: 'stylized',
    thumbnail: 'scifi-green',
    lut: 'SCIFI_GREEN_MATRIX',
    settings: { contrast: 1.25, saturation: 0.9, temperature: -10, tint: -20, shadows: -15, highlights: 5, lift: 0.0, gamma: 0.95, gain: 1.05 },
    tags: ['scifi', 'green', 'matrix', 'digital'],
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    description: 'Warm amber sunset glow - romantic cinematic lighting',
    category: 'stylized',
    thumbnail: 'golden-hour',
    lut: 'GOLDEN_HOUR_WARM',
    settings: { contrast: 1.05, saturation: 1.1, temperature: 25, tint: 5, shadows: 0, highlights: -5, lift: 0.02, gamma: 1.05, gain: 1.0 },
    tags: ['warm', 'golden', 'romantic', 'sunset'],
  },
  {
    id: 'romance_soft',
    name: 'Romance Soft',
    description: 'Dreamy pastel pink tones - wedding and romantic film aesthetic',
    category: 'stylized',
    thumbnail: 'romance-soft',
    lut: 'ROMANCE_PASTEL_SOFT',
    settings: { contrast: 0.95, saturation: 0.9, temperature: 8, tint: 12, shadows: 10, highlights: -10, lift: 0.03, gamma: 1.08, gain: 0.95 },
    tags: ['romantic', 'soft', 'pastel', 'wedding'],
  },
  // Music Video LUTs
  {
    id: 'vibrant_pop',
    name: 'Vibrant Pop',
    description: 'High saturation punchy colors - music video energy',
    category: 'music_video',
    thumbnail: 'vibrant-pop',
    lut: 'VIBRANT_POP_MV',
    settings: { contrast: 1.3, saturation: 1.4, temperature: 0, tint: 0, shadows: -8, highlights: 15, lift: -0.01, gamma: 0.98, gain: 1.1 },
    tags: ['vibrant', 'pop', 'colorful', 'energetic'],
  },
  // Broadcast LUTs
  {
    id: 'clean_natural',
    name: 'Clean Natural',
    description: 'Neutral broadcast-safe grading - commercial and documentary',
    category: 'broadcast',
    thumbnail: 'clean-natural',
    lut: 'BROADCAST_NATURAL',
    settings: { contrast: 1.05, saturation: 1.0, temperature: 0, tint: 0, shadows: 0, highlights: 0, lift: 0.0, gamma: 1.0, gain: 1.0 },
    tags: ['natural', 'clean', 'broadcast', 'neutral'],
  },
];

// Legacy COLOR_GRADES for backward compatibility
 export const COLOR_GRADES: ColorGrade[] = [
   {
     id: 'cinematic_teal_orange',
     name: 'Cinematic Teal & Orange',
     description: 'Hollywood blockbuster color science',
     lut: 'CINEMATIC_TEAL_ORANGE',
     settings: { contrast: 1.2, saturation: 0.9, temperature: -5, tint: 0, shadows: -10, highlights: 5 },
   },
   {
     id: 'vintage_film',
     name: 'Vintage Film',
     description: 'Nostalgic analog film aesthetic',
     lut: 'VINTAGE_FILM',
     settings: { contrast: 1.1, saturation: 0.8, temperature: 10, tint: 5, shadows: 5, highlights: -5 },
   },
   {
     id: 'moody_desaturated',
     name: 'Moody Desaturated',
     description: 'Dark, atmospheric low-sat look',
     lut: 'MOODY_DESAT',
     settings: { contrast: 1.3, saturation: 0.6, temperature: -10, tint: 0, shadows: -15, highlights: 0 },
   },
   {
     id: 'vibrant_pop',
     name: 'Vibrant Pop',
     description: 'Punchy, saturated music video look',
     lut: 'VIBRANT_POP',
     settings: { contrast: 1.25, saturation: 1.3, temperature: 0, tint: 0, shadows: -5, highlights: 10 },
   },
   {
     id: 'clean_natural',
     name: 'Clean Natural',
     description: 'Neutral, broadcast-safe grading',
     lut: 'CLEAN_NATURAL',
     settings: { contrast: 1.05, saturation: 1.0, temperature: 0, tint: 0, shadows: 0, highlights: 0 },
   },
   {
     id: 'neon_nights',
     name: 'Neon Nights',
     description: 'Cyberpunk neon glow aesthetic',
     lut: 'NEON_NIGHTS',
     settings: { contrast: 1.4, saturation: 1.2, temperature: -15, tint: 10, shadows: -20, highlights: 15 },
   },
 ];
 
 // ============================================
 // EFFECTS & TRANSITIONS
 // ============================================
 
 export const EFFECT_PRESETS: EffectPreset[] = [
   {
     id: 'hype_mode',
     name: 'Hype Mode',
     description: 'Maximum energy with glitches and zooms',
     transitions: ['glitch_cut', 'zoom_transition', 'whip_pan', 'flash_cut'],
     motionEffects: ['zoom_pulse', 'shake', 'speed_ramp', 'rgb_split'],
     intensity: 'intense',
   },
   {
     id: 'cinematic_mode',
     name: 'Cinematic Mode',
     description: 'Elegant film-style transitions',
     transitions: ['cross_dissolve', 'dip_to_black', 'match_cut', 'l_cut'],
     motionEffects: ['smooth_zoom', 'dolly_zoom', 'light_bloom', 'lens_flare'],
     intensity: 'subtle',
   },
   {
     id: 'clean_mode',
     name: 'Clean Mode',
     description: 'Minimal professional transitions',
     transitions: ['cut', 'cross_dissolve', 'fade'],
     motionEffects: ['stabilization', 'subtle_zoom'],
     intensity: 'subtle',
   },
   {
     id: 'retro_mode',
     name: 'Retro Mode',
     description: 'VHS and analog-inspired effects',
     transitions: ['vhs_glitch', 'static_cut', 'film_burn', 'light_leak'],
     motionEffects: ['film_grain', 'vhs_tracking', 'chromatic_aberration', 'scanlines'],
     intensity: 'moderate',
   },
   {
     id: 'dynamic_mode',
     name: 'Dynamic Mode',
     description: 'Motion-heavy action style',
     transitions: ['whip_pan', 'spin_transition', 'slide_push', 'morph_cut'],
     motionEffects: ['motion_blur', 'speed_ramp', 'elastic_zoom', 'camera_shake'],
     intensity: 'intense',
   },
 ];
 
 // ============================================
 // GRAPHICS TEMPLATES
 // ============================================
 
 export const GRAPHICS_TEMPLATES: GraphicsTemplate[] = [
   {
     id: 'title_cinematic',
     name: 'Cinematic Title',
     description: 'Elegant fade-in title with tracking',
     type: 'title',
     style: 'serif_elegant',
     animation: 'fade_tracking',
   },
   {
     id: 'title_bold',
     name: 'Bold Impact',
     description: 'Heavy sans-serif punch-in title',
     type: 'title',
     style: 'sans_bold',
     animation: 'scale_punch',
   },
   {
     id: 'title_glitch',
     name: 'Glitch Title',
     description: 'Digital glitch reveal animation',
     type: 'title',
     style: 'mono_tech',
     animation: 'glitch_reveal',
   },
   {
     id: 'lower_third_clean',
     name: 'Clean Lower Third',
     description: 'Minimal professional name/title',
     type: 'lower_third',
     style: 'minimal',
     animation: 'slide_in',
   },
   {
     id: 'lower_third_broadcast',
     name: 'Broadcast Lower Third',
     description: 'News/interview style graphic',
     type: 'lower_third',
     style: 'broadcast',
     animation: 'wipe_reveal',
   },
   {
     id: 'caption_beat_sync',
     name: 'Beat-Synced Captions',
     description: 'Lyrics that pulse with music',
     type: 'caption',
     style: 'dynamic',
     animation: 'beat_pulse',
   },
   {
     id: 'caption_karaoke',
     name: 'Karaoke Style',
     description: 'Word-by-word highlight captions',
     type: 'caption',
     style: 'karaoke',
     animation: 'word_highlight',
   },
   {
     id: 'opener_epic',
     name: 'Epic Opener',
     description: 'Dramatic reveal with particles',
     type: 'opener',
     style: 'cinematic',
     animation: 'particle_reveal',
   },
   {
     id: 'end_card_social',
     name: 'Social End Card',
     description: 'Subscribe/follow CTA end screen',
     type: 'end_card',
     style: 'social',
     animation: 'pop_in',
   },
 ];
 
 // ============================================
 // EXPORT FORMATS
 // ============================================
 
 export const EXPORT_FORMATS: ExportFormat[] = [
  // Video Formats - Render directly
  {
    id: 'mp4_h264',
    name: 'MP4 (H.264)',
    extension: '.mp4',
    codec: 'H.264/AVC',
    resolution: '4K',
    bitrate: '50 Mbps',
  },
  {
    id: 'mp4_hevc',
    name: 'MP4 (H.265/HEVC)',
    extension: '.mp4',
    codec: 'H.265/HEVC',
    resolution: '8K',
    bitrate: '100 Mbps',
  },
  {
    id: 'mov_prores',
    name: 'ProRes 422 HQ',
    extension: '.mov',
    codec: 'ProRes 422 HQ',
    resolution: '8K',
    bitrate: '220 Mbps',
  },
  {
    id: 'mov_prores_4444',
    name: 'ProRes 4444',
    extension: '.mov',
    codec: 'ProRes 4444',
    resolution: '8K',
    bitrate: '330 Mbps',
  },
  {
    id: 'dnxhd',
    name: 'DNxHD/DNxHR',
    extension: '.mxf',
    codec: 'DNxHR HQX',
    resolution: '8K',
    bitrate: '185 Mbps',
  },
  {
    id: 'webm_vp9',
    name: 'WebM (VP9)',
    extension: '.webm',
    codec: 'VP9',
    resolution: '4K',
    bitrate: '35 Mbps',
  },
  {
    id: 'avi_uncompressed',
    name: 'Uncompressed AVI',
    extension: '.avi',
    codec: 'Uncompressed',
    resolution: '4K',
    bitrate: '1.5 Gbps',
  },
  // Project/Timeline Formats
   {
     id: 'fcpxml',
     name: 'Final Cut Pro XML',
     extension: '.fcpxml',
     codec: 'N/A',
     resolution: 'Source',
     bitrate: 'N/A',
   },
   {
     id: 'premiere_xml',
     name: 'Premiere Pro XML',
     extension: '.xml',
     codec: 'N/A',
     resolution: 'Source',
     bitrate: 'N/A',
   },
   {
     id: 'davinci_xml',
     name: 'DaVinci Resolve XML',
     extension: '.xml',
     codec: 'N/A',
     resolution: 'Source',
     bitrate: 'N/A',
   },
   {
     id: 'edl',
     name: 'Edit Decision List',
     extension: '.edl',
     codec: 'N/A',
     resolution: 'Source',
     bitrate: 'N/A',
   },
   {
     id: 'aaf',
     name: 'Avid AAF',
     extension: '.aaf',
     codec: 'N/A',
     resolution: 'Source',
     bitrate: 'N/A',
   },
 ];
 
 // ============================================
 // AI MODELS
 // ============================================
 
 export const AI_MODELS = [
   // Gemini Models - Google's Advanced AI
   { 
     id: 'google/gemini-3-flash-preview', 
     name: 'Gemini 3 Flash', 
     description: 'Ultra-fast • Next-gen speed',
     provider: 'gemini',
     tier: 'fast',
   },
   { 
     id: 'google/gemini-2.5-pro', 
     name: 'Gemini 2.5 Pro', 
     description: 'Maximum power • Complex timelines',
     provider: 'gemini',
     tier: 'premium',
   },
   { 
     id: 'google/gemini-2.5-flash', 
     name: 'Gemini 2.5 Flash', 
     description: 'Balanced • Great for music videos',
     provider: 'gemini',
     tier: 'balanced',
   },
   { 
     id: 'google/gemini-2.5-flash-lite', 
     name: 'Gemini 2.5 Flash Lite', 
     description: 'Lightning fast • Quick edits',
     provider: 'gemini',
     tier: 'fast',
   },
   // OpenAI Models - GPT Power
   { 
     id: 'openai/gpt-5', 
     name: 'GPT-5', 
     description: 'Premium accuracy • Best for complex edits',
     provider: 'openai',
     tier: 'premium',
   },
   { 
     id: 'openai/gpt-5-mini', 
     name: 'GPT-5 Mini', 
     description: 'Fast & powerful • Recommended',
     provider: 'openai',
     tier: 'balanced',
   },
   { 
     id: 'openai/gpt-5-nano', 
     name: 'GPT-5 Nano', 
     description: 'Speed optimized • Quick iterations',
     provider: 'openai',
     tier: 'fast',
   },
 ];
 
 // Legacy export for compatibility
 export const EDIT_PRESETS = STYLE_PRESETS;

// ============================================
// ADVANCED TRANSITIONS LIBRARY
// ============================================

export interface TransitionPreset {
  id: string;
  name: string;
  description: string;
  category: 'cut' | 'dissolve' | 'wipe' | 'motion' | 'stylized' | 'glitch' | 'light' | 'morph';
  duration: number; // in frames (at 24fps)
  minDuration: number;
  maxDuration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  parameters: Record<string, number>;
  thumbnail: string;
  intensity: 'subtle' | 'moderate' | 'intense';
  beatSync: boolean;
  tags: string[];
}

export const TRANSITION_LIBRARY: TransitionPreset[] = [
  // === CUT TRANSITIONS ===
  {
    id: 'hard_cut',
    name: 'Hard Cut',
    description: 'Instant cut with no transition effect',
    category: 'cut',
    duration: 0,
    minDuration: 0,
    maxDuration: 0,
    easing: 'linear',
    parameters: {},
    thumbnail: 'hard-cut',
    intensity: 'subtle',
    beatSync: true,
    tags: ['fast', 'clean', 'minimal'],
  },
  {
    id: 'flash_cut',
    name: 'Flash Cut',
    description: 'White flash between clips for impact',
    category: 'cut',
    duration: 4,
    minDuration: 2,
    maxDuration: 12,
    easing: 'ease-out',
    parameters: { brightness: 200, fadeSpeed: 0.8 },
    thumbnail: 'flash-cut',
    intensity: 'intense',
    beatSync: true,
    tags: ['impact', 'energy', 'beat'],
  },
  {
    id: 'black_cut',
    name: 'Black Cut',
    description: 'Quick dip to black and back',
    category: 'cut',
    duration: 6,
    minDuration: 3,
    maxDuration: 18,
    easing: 'ease-in-out',
    parameters: { fadeSpeed: 0.7 },
    thumbnail: 'black-cut',
    intensity: 'moderate',
    beatSync: true,
    tags: ['dramatic', 'pause', 'section'],
  },
  {
    id: 'j_cut',
    name: 'J-Cut',
    description: 'Audio leads video - audio from next clip starts early',
    category: 'cut',
    duration: 12,
    minDuration: 6,
    maxDuration: 48,
    easing: 'linear',
    parameters: { audioLead: 0.5 },
    thumbnail: 'j-cut',
    intensity: 'subtle',
    beatSync: false,
    tags: ['dialogue', 'narrative', 'professional'],
  },
  {
    id: 'l_cut',
    name: 'L-Cut',
    description: 'Video leads audio - video changes before audio',
    category: 'cut',
    duration: 12,
    minDuration: 6,
    maxDuration: 48,
    easing: 'linear',
    parameters: { videoLead: 0.5 },
    thumbnail: 'l-cut',
    intensity: 'subtle',
    beatSync: false,
    tags: ['dialogue', 'reaction', 'professional'],
  },
  {
    id: 'match_cut',
    name: 'Match Cut',
    description: 'Cut on matching action or shape between clips',
    category: 'cut',
    duration: 0,
    minDuration: 0,
    maxDuration: 0,
    easing: 'linear',
    parameters: { matchType: 1 }, // 1=action, 2=shape, 3=color
    thumbnail: 'match-cut',
    intensity: 'subtle',
    beatSync: false,
    tags: ['cinematic', 'creative', 'narrative'],
  },

  // === DISSOLVE TRANSITIONS ===
  {
    id: 'cross_dissolve',
    name: 'Cross Dissolve',
    description: 'Classic smooth blend between clips',
    category: 'dissolve',
    duration: 24,
    minDuration: 6,
    maxDuration: 72,
    easing: 'ease-in-out',
    parameters: { curve: 0.5 },
    thumbnail: 'cross-dissolve',
    intensity: 'subtle',
    beatSync: false,
    tags: ['classic', 'smooth', 'cinematic'],
  },
  {
    id: 'additive_dissolve',
    name: 'Additive Dissolve',
    description: 'Bright blend that adds light values',
    category: 'dissolve',
    duration: 18,
    minDuration: 6,
    maxDuration: 48,
    easing: 'ease-out',
    parameters: { brightness: 1.2 },
    thumbnail: 'additive-dissolve',
    intensity: 'moderate',
    beatSync: false,
    tags: ['bright', 'dreamy', 'light'],
  },
  {
    id: 'dip_to_black',
    name: 'Dip to Black',
    description: 'Fade out to black then fade in next clip',
    category: 'dissolve',
    duration: 36,
    minDuration: 12,
    maxDuration: 96,
    easing: 'ease-in-out',
    parameters: { holdBlack: 0.3 },
    thumbnail: 'dip-black',
    intensity: 'moderate',
    beatSync: false,
    tags: ['section', 'dramatic', 'scene-change'],
  },
  {
    id: 'dip_to_white',
    name: 'Dip to White',
    description: 'Fade out to white then fade in next clip',
    category: 'dissolve',
    duration: 36,
    minDuration: 12,
    maxDuration: 96,
    easing: 'ease-in-out',
    parameters: { holdWhite: 0.3 },
    thumbnail: 'dip-white',
    intensity: 'moderate',
    beatSync: false,
    tags: ['bright', 'dreamy', 'flashback'],
  },
  {
    id: 'film_dissolve',
    name: 'Film Dissolve',
    description: 'Organic film-like dissolve with grain',
    category: 'dissolve',
    duration: 30,
    minDuration: 12,
    maxDuration: 72,
    easing: 'ease-in-out',
    parameters: { grain: 0.3, softness: 0.4 },
    thumbnail: 'film-dissolve',
    intensity: 'subtle',
    beatSync: false,
    tags: ['film', 'organic', 'vintage'],
  },

  // === WIPE TRANSITIONS ===
  {
    id: 'wipe_left',
    name: 'Wipe Left',
    description: 'Horizontal wipe from right to left',
    category: 'wipe',
    duration: 18,
    minDuration: 6,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { direction: 180, softness: 0.1 },
    thumbnail: 'wipe-left',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'directional', 'broadcast'],
  },
  {
    id: 'wipe_right',
    name: 'Wipe Right',
    description: 'Horizontal wipe from left to right',
    category: 'wipe',
    duration: 18,
    minDuration: 6,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { direction: 0, softness: 0.1 },
    thumbnail: 'wipe-right',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'directional', 'broadcast'],
  },
  {
    id: 'wipe_up',
    name: 'Wipe Up',
    description: 'Vertical wipe from bottom to top',
    category: 'wipe',
    duration: 18,
    minDuration: 6,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { direction: 90, softness: 0.1 },
    thumbnail: 'wipe-up',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'directional', 'reveal'],
  },
  {
    id: 'wipe_down',
    name: 'Wipe Down',
    description: 'Vertical wipe from top to bottom',
    category: 'wipe',
    duration: 18,
    minDuration: 6,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { direction: 270, softness: 0.1 },
    thumbnail: 'wipe-down',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'directional', 'reveal'],
  },
  {
    id: 'iris_wipe',
    name: 'Iris Wipe',
    description: 'Circular reveal from center or edge',
    category: 'wipe',
    duration: 24,
    minDuration: 12,
    maxDuration: 60,
    easing: 'ease-out',
    parameters: { startRadius: 0, centerX: 0.5, centerY: 0.5 },
    thumbnail: 'iris-wipe',
    intensity: 'moderate',
    beatSync: true,
    tags: ['classic', 'retro', 'focus'],
  },
  {
    id: 'clock_wipe',
    name: 'Clock Wipe',
    description: 'Radial wipe like clock hands',
    category: 'wipe',
    duration: 24,
    minDuration: 12,
    maxDuration: 72,
    easing: 'linear',
    parameters: { startAngle: 0, clockwise: 1 },
    thumbnail: 'clock-wipe',
    intensity: 'moderate',
    beatSync: false,
    tags: ['time', 'retro', 'transition'],
  },
  {
    id: 'star_wipe',
    name: 'Star Wipe',
    description: 'Fun star-shaped reveal transition',
    category: 'wipe',
    duration: 24,
    minDuration: 12,
    maxDuration: 48,
    easing: 'ease-out',
    parameters: { points: 5, rotation: 0 },
    thumbnail: 'star-wipe',
    intensity: 'intense',
    beatSync: true,
    tags: ['fun', 'retro', 'playful'],
  },

  // === MOTION TRANSITIONS ===
  {
    id: 'zoom_in',
    name: 'Zoom In',
    description: 'Zoom into next clip with motion blur',
    category: 'motion',
    duration: 12,
    minDuration: 4,
    maxDuration: 36,
    easing: 'ease-in',
    parameters: { scale: 3.0, blur: 0.5 },
    thumbnail: 'zoom-in',
    intensity: 'intense',
    beatSync: true,
    tags: ['energy', 'impact', 'dramatic'],
  },
  {
    id: 'zoom_out',
    name: 'Zoom Out',
    description: 'Zoom out from current clip',
    category: 'motion',
    duration: 12,
    minDuration: 4,
    maxDuration: 36,
    easing: 'ease-out',
    parameters: { scale: 0.3, blur: 0.5 },
    thumbnail: 'zoom-out',
    intensity: 'intense',
    beatSync: true,
    tags: ['reveal', 'perspective', 'dramatic'],
  },
  {
    id: 'whip_pan_left',
    name: 'Whip Pan Left',
    description: 'Fast camera pan with motion blur',
    category: 'motion',
    duration: 8,
    minDuration: 4,
    maxDuration: 18,
    easing: 'ease-in-out',
    parameters: { blur: 0.8, direction: 180 },
    thumbnail: 'whip-left',
    intensity: 'intense',
    beatSync: true,
    tags: ['energy', 'fast', 'action'],
  },
  {
    id: 'whip_pan_right',
    name: 'Whip Pan Right',
    description: 'Fast camera pan with motion blur',
    category: 'motion',
    duration: 8,
    minDuration: 4,
    maxDuration: 18,
    easing: 'ease-in-out',
    parameters: { blur: 0.8, direction: 0 },
    thumbnail: 'whip-right',
    intensity: 'intense',
    beatSync: true,
    tags: ['energy', 'fast', 'action'],
  },
  {
    id: 'spin_transition',
    name: 'Spin Transition',
    description: 'Rotating blur transition between clips',
    category: 'motion',
    duration: 12,
    minDuration: 6,
    maxDuration: 30,
    easing: 'ease-in-out',
    parameters: { rotation: 360, blur: 0.7 },
    thumbnail: 'spin',
    intensity: 'intense',
    beatSync: true,
    tags: ['dynamic', 'energy', 'creative'],
  },
  {
    id: 'slide_left',
    name: 'Slide Left',
    description: 'Next clip slides in from right',
    category: 'motion',
    duration: 15,
    minDuration: 6,
    maxDuration: 36,
    easing: 'ease-out',
    parameters: { direction: 180 },
    thumbnail: 'slide-left',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'modern', 'slide'],
  },
  {
    id: 'slide_right',
    name: 'Slide Right',
    description: 'Next clip slides in from left',
    category: 'motion',
    duration: 15,
    minDuration: 6,
    maxDuration: 36,
    easing: 'ease-out',
    parameters: { direction: 0 },
    thumbnail: 'slide-right',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'modern', 'slide'],
  },
  {
    id: 'push_transition',
    name: 'Push',
    description: 'Current clip pushes off as next slides in',
    category: 'motion',
    duration: 18,
    minDuration: 8,
    maxDuration: 42,
    easing: 'ease-in-out',
    parameters: { direction: 0 },
    thumbnail: 'push',
    intensity: 'moderate',
    beatSync: true,
    tags: ['clean', 'broadcast', 'professional'],
  },
  {
    id: '3d_flip',
    name: '3D Flip',
    description: 'Card flip with 3D perspective',
    category: 'motion',
    duration: 18,
    minDuration: 10,
    maxDuration: 36,
    easing: 'ease-in-out',
    parameters: { axis: 1, perspective: 1000 }, // 0=X, 1=Y
    thumbnail: '3d-flip',
    intensity: 'moderate',
    beatSync: true,
    tags: ['3d', 'creative', 'modern'],
  },
  {
    id: '3d_cube',
    name: '3D Cube',
    description: 'Rotating cube transition',
    category: 'motion',
    duration: 24,
    minDuration: 12,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { direction: 0, perspective: 1200 },
    thumbnail: '3d-cube',
    intensity: 'intense',
    beatSync: true,
    tags: ['3d', 'dynamic', 'creative'],
  },

  // === STYLIZED TRANSITIONS ===
  {
    id: 'ink_blot',
    name: 'Ink Blot',
    description: 'Organic ink spreading reveal',
    category: 'stylized',
    duration: 30,
    minDuration: 18,
    maxDuration: 72,
    easing: 'ease-out',
    parameters: { spread: 0.8, organic: 0.6 },
    thumbnail: 'ink-blot',
    intensity: 'moderate',
    beatSync: false,
    tags: ['artistic', 'organic', 'creative'],
  },
  {
    id: 'paint_brush',
    name: 'Paint Brush',
    description: 'Brush stroke reveal transition',
    category: 'stylized',
    duration: 24,
    minDuration: 12,
    maxDuration: 60,
    easing: 'ease-out',
    parameters: { strokes: 3, texture: 0.7 },
    thumbnail: 'paint-brush',
    intensity: 'moderate',
    beatSync: false,
    tags: ['artistic', 'paint', 'creative'],
  },
  {
    id: 'shatter',
    name: 'Shatter',
    description: 'Image breaks into pieces',
    category: 'stylized',
    duration: 18,
    minDuration: 8,
    maxDuration: 36,
    easing: 'ease-in',
    parameters: { pieces: 50, gravity: 0.8, rotation: 0.5 },
    thumbnail: 'shatter',
    intensity: 'intense',
    beatSync: true,
    tags: ['dramatic', 'impact', 'destruction'],
  },
  {
    id: 'pixelate',
    name: 'Pixelate',
    description: 'Dissolve through pixelation',
    category: 'stylized',
    duration: 18,
    minDuration: 8,
    maxDuration: 42,
    easing: 'ease-in-out',
    parameters: { maxPixelSize: 64, curve: 0.5 },
    thumbnail: 'pixelate',
    intensity: 'moderate',
    beatSync: true,
    tags: ['digital', 'retro', 'tech'],
  },
  {
    id: 'ripple',
    name: 'Ripple',
    description: 'Water ripple distortion transition',
    category: 'stylized',
    duration: 24,
    minDuration: 12,
    maxDuration: 48,
    easing: 'ease-out',
    parameters: { amplitude: 0.3, frequency: 10, decay: 0.5 },
    thumbnail: 'ripple',
    intensity: 'moderate',
    beatSync: false,
    tags: ['water', 'dreamy', 'organic'],
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    description: 'Tile-based reveal transition',
    category: 'stylized',
    duration: 24,
    minDuration: 12,
    maxDuration: 60,
    easing: 'ease-out',
    parameters: { tilesX: 8, tilesY: 6, randomness: 0.4 },
    thumbnail: 'mosaic',
    intensity: 'moderate',
    beatSync: true,
    tags: ['tiles', 'creative', 'pattern'],
  },

  // === GLITCH TRANSITIONS ===
  {
    id: 'glitch_basic',
    name: 'Glitch',
    description: 'Digital glitch corruption effect',
    category: 'glitch',
    duration: 8,
    minDuration: 4,
    maxDuration: 24,
    easing: 'linear',
    parameters: { intensity: 0.7, rgbSplit: 0.5, noise: 0.3 },
    thumbnail: 'glitch',
    intensity: 'intense',
    beatSync: true,
    tags: ['digital', 'tech', 'corruption'],
  },
  {
    id: 'rgb_split',
    name: 'RGB Split',
    description: 'Chromatic aberration glitch',
    category: 'glitch',
    duration: 6,
    minDuration: 3,
    maxDuration: 18,
    easing: 'ease-out',
    parameters: { amount: 30, direction: 0 },
    thumbnail: 'rgb-split',
    intensity: 'intense',
    beatSync: true,
    tags: ['color', 'distortion', 'tech'],
  },
  {
    id: 'vhs_glitch',
    name: 'VHS Glitch',
    description: 'Analog VHS tape corruption',
    category: 'glitch',
    duration: 12,
    minDuration: 6,
    maxDuration: 30,
    easing: 'linear',
    parameters: { tracking: 0.6, static: 0.4, colorBleed: 0.5 },
    thumbnail: 'vhs-glitch',
    intensity: 'moderate',
    beatSync: true,
    tags: ['retro', 'analog', 'vhs'],
  },
  {
    id: 'digital_noise',
    name: 'Digital Noise',
    description: 'Static noise burst transition',
    category: 'glitch',
    duration: 6,
    minDuration: 2,
    maxDuration: 18,
    easing: 'linear',
    parameters: { density: 0.8, colored: 0.3 },
    thumbnail: 'digital-noise',
    intensity: 'intense',
    beatSync: true,
    tags: ['noise', 'static', 'tech'],
  },
  {
    id: 'data_mosh',
    name: 'Datamosh',
    description: 'Video compression artifact effect',
    category: 'glitch',
    duration: 18,
    minDuration: 8,
    maxDuration: 42,
    easing: 'linear',
    parameters: { blockiness: 0.7, smear: 0.5 },
    thumbnail: 'datamosh',
    intensity: 'intense',
    beatSync: true,
    tags: ['compression', 'artistic', 'experimental'],
  },
  {
    id: 'scan_lines',
    name: 'Scan Lines',
    description: 'CRT scan line reveal',
    category: 'glitch',
    duration: 12,
    minDuration: 6,
    maxDuration: 30,
    easing: 'ease-out',
    parameters: { lineCount: 100, flickr: 0.3 },
    thumbnail: 'scanlines',
    intensity: 'moderate',
    beatSync: true,
    tags: ['retro', 'crt', 'analog'],
  },

  // === LIGHT TRANSITIONS ===
  {
    id: 'light_leak',
    name: 'Light Leak',
    description: 'Film light leak overlay transition',
    category: 'light',
    duration: 24,
    minDuration: 12,
    maxDuration: 60,
    easing: 'ease-in-out',
    parameters: { color: 1, intensity: 0.8, organic: 0.7 }, // color: 0=warm, 1=cool, 2=mixed
    thumbnail: 'light-leak',
    intensity: 'moderate',
    beatSync: false,
    tags: ['film', 'organic', 'dreamy'],
  },
  {
    id: 'lens_flare',
    name: 'Lens Flare',
    description: 'Anamorphic lens flare wipe',
    category: 'light',
    duration: 18,
    minDuration: 8,
    maxDuration: 42,
    easing: 'ease-out',
    parameters: { streaks: 6, intensity: 0.9, color: 0 },
    thumbnail: 'lens-flare',
    intensity: 'moderate',
    beatSync: true,
    tags: ['cinematic', 'anamorphic', 'bright'],
  },
  {
    id: 'film_burn',
    name: 'Film Burn',
    description: 'Celluloid film burn transition',
    category: 'light',
    duration: 30,
    minDuration: 18,
    maxDuration: 72,
    easing: 'ease-in',
    parameters: { spread: 0.6, color: 1, organic: 0.8 },
    thumbnail: 'film-burn',
    intensity: 'intense',
    beatSync: false,
    tags: ['film', 'vintage', 'organic'],
  },
  {
    id: 'flash_strobe',
    name: 'Strobe Flash',
    description: 'Rapid strobe light effect',
    category: 'light',
    duration: 12,
    minDuration: 4,
    maxDuration: 24,
    easing: 'linear',
    parameters: { frequency: 4, intensity: 1.0 },
    thumbnail: 'strobe',
    intensity: 'intense',
    beatSync: true,
    tags: ['strobe', 'energy', 'club'],
  },
  {
    id: 'bokeh_blur',
    name: 'Bokeh Blur',
    description: 'Dreamy bokeh lens blur transition',
    category: 'light',
    duration: 24,
    minDuration: 12,
    maxDuration: 48,
    easing: 'ease-in-out',
    parameters: { amount: 0.8, shape: 6 }, // shape = bokeh blade count
    thumbnail: 'bokeh',
    intensity: 'moderate',
    beatSync: false,
    tags: ['dreamy', 'soft', 'romantic'],
  },
  {
    id: 'prism',
    name: 'Prism',
    description: 'Prismatic light refraction',
    category: 'light',
    duration: 18,
    minDuration: 8,
    maxDuration: 36,
    easing: 'ease-out',
    parameters: { spread: 0.5, rainbow: 0.7 },
    thumbnail: 'prism',
    intensity: 'moderate',
    beatSync: true,
    tags: ['rainbow', 'light', 'creative'],
  },

  // === MORPH TRANSITIONS ===
  {
    id: 'morph_cut',
    name: 'Morph Cut',
    description: 'AI-powered seamless morph between similar shots',
    category: 'morph',
    duration: 12,
    minDuration: 6,
    maxDuration: 36,
    easing: 'ease-in-out',
    parameters: { smoothness: 0.8 },
    thumbnail: 'morph-cut',
    intensity: 'subtle',
    beatSync: false,
    tags: ['seamless', 'ai', 'interview'],
  },
  {
    id: 'face_morph',
    name: 'Face Morph',
    description: 'Morph between faces in frame',
    category: 'morph',
    duration: 36,
    minDuration: 18,
    maxDuration: 96,
    easing: 'ease-in-out',
    parameters: { smoothness: 0.9, faceDetection: 1 },
    thumbnail: 'face-morph',
    intensity: 'moderate',
    beatSync: false,
    tags: ['face', 'transform', 'creative'],
  },
  {
    id: 'liquid_morph',
    name: 'Liquid Morph',
    description: 'Fluid organic shape morphing',
    category: 'morph',
    duration: 24,
    minDuration: 12,
    maxDuration: 60,
    easing: 'ease-in-out',
    parameters: { viscosity: 0.6, turbulence: 0.4 },
    thumbnail: 'liquid-morph',
    intensity: 'moderate',
    beatSync: false,
    tags: ['organic', 'fluid', 'creative'],
  },
  {
    id: 'warp_morph',
    name: 'Warp Morph',
    description: 'Perspective warp morphing',
    category: 'morph',
    duration: 18,
    minDuration: 8,
    maxDuration: 42,
    easing: 'ease-in-out',
    parameters: { distortion: 0.5 },
    thumbnail: 'warp-morph',
    intensity: 'moderate',
    beatSync: true,
    tags: ['warp', 'distortion', 'dynamic'],
  },
];

// Get transitions by category
export const getTransitionsByCategory = (category: TransitionPreset['category']) => 
  TRANSITION_LIBRARY.filter(t => t.category === category);

// Get beat-syncable transitions
export const getBeatSyncTransitions = () => 
  TRANSITION_LIBRARY.filter(t => t.beatSync);

// ============================================
// SHOT INTELLIGENCE (AI ANALYSIS)
// ============================================

export interface ShotAnalysis {
  id: string;
  name: string;
  description: string;
  category: 'framing' | 'camera' | 'quality' | 'content' | 'emotion';
  icon: string;
  values: string[];
}

export const SHOT_ANALYSIS_TYPES: ShotAnalysis[] = [
  // Framing Analysis
  {
    id: 'shot_type',
    name: 'Shot Type',
    description: 'Detected camera framing',
    category: 'framing',
    icon: 'frame',
    values: ['Extreme Close-up', 'Close-up', 'Medium Close-up', 'Medium Shot', 'Medium Wide', 'Wide Shot', 'Extreme Wide', 'Establishing'],
  },
  {
    id: 'composition',
    name: 'Composition',
    description: 'Frame composition analysis',
    category: 'framing',
    icon: 'grid',
    values: ['Rule of Thirds', 'Center Frame', 'Golden Ratio', 'Symmetrical', 'Asymmetrical', 'Leading Lines', 'Frame within Frame'],
  },
  {
    id: 'aspect_ratio',
    name: 'Native Aspect',
    description: 'Detected aspect ratio',
    category: 'framing',
    icon: 'ratio',
    values: ['16:9', '2.39:1', '4:3', '1:1', '9:16', '21:9', '1.85:1'],
  },

  // Camera Analysis
  {
    id: 'camera_motion',
    name: 'Camera Motion',
    description: 'Detected camera movement',
    category: 'camera',
    icon: 'move',
    values: ['Static', 'Handheld', 'Gimbal', 'Dolly', 'Tracking', 'Crane', 'Drone', 'Pan', 'Tilt', 'Zoom'],
  },
  {
    id: 'stabilization',
    name: 'Stabilization',
    description: 'Camera stability rating',
    category: 'camera',
    icon: 'lock',
    values: ['Rock Solid', 'Stabilized', 'Natural', 'Handheld', 'Shaky', 'Very Shaky'],
  },
  {
    id: 'motion_speed',
    name: 'Motion Speed',
    description: 'Camera movement speed',
    category: 'camera',
    icon: 'gauge',
    values: ['Static', 'Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast', 'Whip'],
  },

  // Quality Analysis
  {
    id: 'focus_quality',
    name: 'Focus',
    description: 'Focus sharpness rating',
    category: 'quality',
    icon: 'eye',
    values: ['Tack Sharp', 'Sharp', 'Soft', 'Out of Focus', 'Rack Focus'],
  },
  {
    id: 'exposure',
    name: 'Exposure',
    description: 'Exposure quality rating',
    category: 'quality',
    icon: 'sun',
    values: ['Perfect', 'Slightly Over', 'Slightly Under', 'Overexposed', 'Underexposed', 'High Key', 'Low Key'],
  },
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Lighting quality and type',
    category: 'quality',
    icon: 'lightbulb',
    values: ['Studio', 'Natural', 'Golden Hour', 'Blue Hour', 'Night', 'Neon', 'Harsh', 'Soft', 'Rim', 'Silhouette'],
  },
  {
    id: 'noise_grain',
    name: 'Noise/Grain',
    description: 'Image noise level',
    category: 'quality',
    icon: 'grain',
    values: ['Clean', 'Minimal', 'Noticeable', 'Noisy', 'Very Noisy'],
  },

  // Content Analysis
  {
    id: 'faces_detected',
    name: 'Faces',
    description: 'Number of faces in frame',
    category: 'content',
    icon: 'user',
    values: ['No Faces', '1 Face', '2 Faces', '3+ Faces', 'Group', 'Crowd'],
  },
  {
    id: 'subject',
    name: 'Subject',
    description: 'Primary subject type',
    category: 'content',
    icon: 'focus',
    values: ['Person', 'Object', 'Location', 'Action', 'Abstract', 'Text', 'Product'],
  },
  {
    id: 'scene_type',
    name: 'Scene',
    description: 'Scene environment type',
    category: 'content',
    icon: 'image',
    values: ['Interior', 'Exterior', 'Studio', 'Street', 'Nature', 'Urban', 'Stage', 'Vehicle'],
  },

  // Emotion Analysis
  {
    id: 'energy_level',
    name: 'Energy',
    description: 'Visual energy/intensity',
    category: 'emotion',
    icon: 'zap',
    values: ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Explosive'],
  },
  {
    id: 'mood',
    name: 'Mood',
    description: 'Emotional mood detected',
    category: 'emotion',
    icon: 'heart',
    values: ['Happy', 'Sad', 'Intense', 'Calm', 'Romantic', 'Dark', 'Energetic', 'Mysterious', 'Triumphant'],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Subject performance quality',
    category: 'emotion',
    icon: 'star',
    values: ['Hero Shot', 'Great', 'Good', 'Average', 'Weak', 'Unusable'],
  },
];

// ============================================
// BEAT & ENERGY ENGINE
// ============================================

export interface BeatAnalysis {
  id: string;
  name: string;
  description: string;
  icon: string;
  syncable: boolean;
}

export const BEAT_ANALYSIS_TYPES: BeatAnalysis[] = [
  { id: 'bpm', name: 'BPM Detection', description: 'Detect tempo in beats per minute', icon: 'activity', syncable: false },
  { id: 'downbeats', name: 'Downbeats', description: 'Strong beats on 1 and 3', icon: 'chevrons-down', syncable: true },
  { id: 'snare_hits', name: 'Snare Hits', description: 'Snare drum transients', icon: 'disc', syncable: true },
  { id: 'kick_hits', name: 'Kick Hits', description: 'Bass drum transients', icon: 'circle', syncable: true },
  { id: 'hihat_hits', name: 'Hi-Hat Hits', description: 'Hi-hat transients for fast cuts', icon: 'slash', syncable: true },
  { id: 'vocal_phrases', name: 'Vocal Phrases', description: 'Vocal phrase boundaries', icon: 'mic', syncable: true },
  { id: 'drops', name: 'Drops/Builds', description: 'Energy drop and build moments', icon: 'trending-up', syncable: true },
  { id: 'quiet_sections', name: 'Quiet Sections', description: 'Low energy/breakdown sections', icon: 'volume-x', syncable: false },
  { id: 'energy_curve', name: 'Energy Curve', description: 'Overall energy over time', icon: 'bar-chart', syncable: false },
];

export interface BeatSyncRule {
  id: string;
  name: string;
  description: string;
  beatType: string;
  action: 'cut' | 'transition' | 'effect' | 'zoom' | 'flash';
  intensity: 'light' | 'medium' | 'heavy';
}

export const BEAT_SYNC_RULES: BeatSyncRule[] = [
  { id: 'cut_on_snare', name: 'Cut on Snare', description: 'Hard cut on every snare hit', beatType: 'snare_hits', action: 'cut', intensity: 'heavy' },
  { id: 'cut_on_kick', name: 'Cut on Kick', description: 'Cut on bass drum hits', beatType: 'kick_hits', action: 'cut', intensity: 'medium' },
  { id: 'cut_on_downbeat', name: 'Cut on Downbeat', description: 'Cut on strong beats only', beatType: 'downbeats', action: 'cut', intensity: 'light' },
  { id: 'zoom_on_drop', name: 'Zoom on Drop', description: 'Zoom punch on energy drops', beatType: 'drops', action: 'zoom', intensity: 'heavy' },
  { id: 'flash_on_snare', name: 'Flash on Snare', description: 'White flash on snares', beatType: 'snare_hits', action: 'flash', intensity: 'medium' },
  { id: 'transition_on_phrase', name: 'Transition on Phrase', description: 'Stylized transition on vocal phrases', beatType: 'vocal_phrases', action: 'transition', intensity: 'medium' },
  { id: 'effect_on_hihat', name: 'Effect on Hi-Hat', description: 'Glitch effects on hi-hats', beatType: 'hihat_hits', action: 'effect', intensity: 'light' },
];

// ============================================
// DIRECTOR INTENT MODES
// ============================================

export interface DirectorIntent {
  id: string;
  name: string;
  description: string;
  icon: string;
  pacing: 'slow' | 'medium' | 'fast' | 'dynamic';
  shotLength: [number, number]; // min, max in seconds
  preferredTransitions: string[];
  colorStyle: string;
  motionStyle: string;
  energy: 'calm' | 'moderate' | 'high' | 'explosive';
}

export const DIRECTOR_INTENTS: DirectorIntent[] = [
  {
    id: 'emotional',
    name: 'Emotional',
    description: 'Deep, moving, heartfelt storytelling',
    icon: 'heart',
    pacing: 'slow',
    shotLength: [3, 8],
    preferredTransitions: ['cross_dissolve', 'dip_to_black', 'film_dissolve'],
    colorStyle: 'moody_desat',
    motionStyle: 'smooth',
    energy: 'calm',
  },
  {
    id: 'luxury_brand',
    name: 'Luxury Brand',
    description: 'High-end, sophisticated, premium feel',
    icon: 'gem',
    pacing: 'slow',
    shotLength: [2, 6],
    preferredTransitions: ['cross_dissolve', 'additive_dissolve', 'bokeh_blur'],
    colorStyle: 'clean_natural',
    motionStyle: 'elegant',
    energy: 'calm',
  },
  {
    id: 'dark_cinematic',
    name: 'Dark Cinematic',
    description: 'Moody, intense, thriller aesthetic',
    icon: 'moon',
    pacing: 'medium',
    shotLength: [1.5, 5],
    preferredTransitions: ['dip_to_black', 'flash_cut', 'glitch_basic'],
    colorStyle: 'thriller_cold',
    motionStyle: 'tense',
    energy: 'moderate',
  },
  {
    id: 'aggressive_hype',
    name: 'Aggressive Hype',
    description: 'Maximum energy, in-your-face impact',
    icon: 'zap',
    pacing: 'fast',
    shotLength: [0.2, 1.5],
    preferredTransitions: ['flash_cut', 'whip_pan_left', 'zoom_in', 'glitch_basic', 'rgb_split'],
    colorStyle: 'vibrant_pop',
    motionStyle: 'aggressive',
    energy: 'explosive',
  },
  {
    id: 'calm_storytelling',
    name: 'Calm Storytelling',
    description: 'Documentary, narrative, thoughtful',
    icon: 'book-open',
    pacing: 'slow',
    shotLength: [4, 12],
    preferredTransitions: ['cross_dissolve', 'l_cut', 'j_cut'],
    colorStyle: 'clean_natural',
    motionStyle: 'steady',
    energy: 'calm',
  },
  {
    id: 'retro_vintage',
    name: 'Retro Vintage',
    description: '70s/80s nostalgic film aesthetic',
    icon: 'film',
    pacing: 'medium',
    shotLength: [2, 5],
    preferredTransitions: ['film_dissolve', 'vhs_glitch', 'light_leak', 'film_burn'],
    colorStyle: 'vintage_film',
    motionStyle: 'organic',
    energy: 'moderate',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon, futuristic, digital aesthetic',
    icon: 'cpu',
    pacing: 'dynamic',
    shotLength: [0.5, 3],
    preferredTransitions: ['glitch_basic', 'rgb_split', 'digital_noise', 'zoom_in'],
    colorStyle: 'neon_nights',
    motionStyle: 'dynamic',
    energy: 'high',
  },
  {
    id: 'dreamy_romantic',
    name: 'Dreamy Romantic',
    description: 'Soft, ethereal, love story feel',
    icon: 'cloud',
    pacing: 'slow',
    shotLength: [3, 8],
    preferredTransitions: ['additive_dissolve', 'bokeh_blur', 'light_leak', 'dip_to_white'],
    colorStyle: 'romance_soft',
    motionStyle: 'floating',
    energy: 'calm',
  },
  {
    id: 'action_blockbuster',
    name: 'Action Blockbuster',
    description: 'Michael Bay style action sequences',
    icon: 'flame',
    pacing: 'fast',
    shotLength: [0.3, 2],
    preferredTransitions: ['whip_pan_left', 'whip_pan_right', 'zoom_in', 'flash_cut', 'shatter'],
    colorStyle: 'blockbuster_action',
    motionStyle: 'kinetic',
    energy: 'explosive',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Professional, informative, clean',
    icon: 'video',
    pacing: 'medium',
    shotLength: [3, 10],
    preferredTransitions: ['cross_dissolve', 'dip_to_black', 'push_transition'],
    colorStyle: 'clean_natural',
    motionStyle: 'professional',
    energy: 'moderate',
  },
];

// ============================================
// LOOK DESIGNER (PRO STYLING ENGINE)
// ============================================

export interface LookEffect {
  id: string;
  name: string;
  description: string;
  category: 'film' | 'lens' | 'motion' | 'stylize' | 'vintage';
  icon: string;
  parameters: Record<string, { min: number; max: number; default: number; step: number }>;
}

export const LOOK_EFFECTS: LookEffect[] = [
  // Film Effects
  {
    id: 'film_grain',
    name: 'Film Grain',
    description: 'Organic film grain texture',
    category: 'film',
    icon: 'square',
    parameters: {
      amount: { min: 0, max: 100, default: 25, step: 1 },
      size: { min: 0.5, max: 2, default: 1, step: 0.1 },
      roughness: { min: 0, max: 100, default: 50, step: 1 },
    },
  },
  {
    id: 'letterbox',
    name: 'Letterbox',
    description: 'Cinematic aspect ratio bars',
    category: 'film',
    icon: 'minimize-2',
    parameters: {
      ratio: { min: 1.78, max: 2.76, default: 2.39, step: 0.01 },
      opacity: { min: 0, max: 100, default: 100, step: 1 },
    },
  },
  {
    id: 'vignette',
    name: 'Vignette',
    description: 'Edge darkening effect',
    category: 'film',
    icon: 'circle',
    parameters: {
      amount: { min: 0, max: 100, default: 30, step: 1 },
      midpoint: { min: 0, max: 100, default: 50, step: 1 },
      roundness: { min: -100, max: 100, default: 0, step: 1 },
      feather: { min: 0, max: 100, default: 50, step: 1 },
    },
  },
  // Lens Effects
  {
    id: 'chromatic_aberration',
    name: 'Chromatic Aberration',
    description: 'RGB fringing lens distortion',
    category: 'lens',
    icon: 'aperture',
    parameters: {
      amount: { min: 0, max: 50, default: 5, step: 0.5 },
      falloff: { min: 0, max: 100, default: 50, step: 1 },
    },
  },
  {
    id: 'lens_distortion',
    name: 'Lens Distortion',
    description: 'Barrel or pincushion distortion',
    category: 'lens',
    icon: 'maximize',
    parameters: {
      distortion: { min: -100, max: 100, default: 0, step: 1 },
      anamorphic: { min: 0, max: 100, default: 0, step: 1 },
    },
  },
  {
    id: 'halation',
    name: 'Halation',
    description: 'Film highlight bloom glow',
    category: 'lens',
    icon: 'sunrise',
    parameters: {
      amount: { min: 0, max: 100, default: 20, step: 1 },
      threshold: { min: 0, max: 100, default: 70, step: 1 },
      size: { min: 1, max: 100, default: 30, step: 1 },
    },
  },
  {
    id: 'glow',
    name: 'Glow',
    description: 'Soft highlight bloom',
    category: 'lens',
    icon: 'sun',
    parameters: {
      amount: { min: 0, max: 100, default: 15, step: 1 },
      threshold: { min: 0, max: 100, default: 60, step: 1 },
      radius: { min: 1, max: 200, default: 50, step: 1 },
    },
  },
  // Motion Effects
  {
    id: 'camera_shake',
    name: 'Camera Shake',
    description: 'Handheld camera movement',
    category: 'motion',
    icon: 'move',
    parameters: {
      amount: { min: 0, max: 100, default: 10, step: 1 },
      frequency: { min: 0.1, max: 5, default: 1, step: 0.1 },
      rotation: { min: 0, max: 100, default: 20, step: 1 },
    },
  },
  {
    id: 'zoom_pulse',
    name: 'Zoom Pulse',
    description: 'Rhythmic zoom effect',
    category: 'motion',
    icon: 'maximize-2',
    parameters: {
      amount: { min: 0, max: 30, default: 5, step: 0.5 },
      frequency: { min: 0.5, max: 10, default: 2, step: 0.1 },
    },
  },
  {
    id: 'speed_ramp',
    name: 'Speed Ramp',
    description: 'Dynamic speed variation',
    category: 'motion',
    icon: 'fast-forward',
    parameters: {
      slowMo: { min: 10, max: 100, default: 50, step: 1 },
      fastMo: { min: 100, max: 400, default: 150, step: 10 },
      rampDuration: { min: 5, max: 60, default: 20, step: 1 },
    },
  },
  // Stylize Effects
  {
    id: 'light_leaks',
    name: 'Light Leaks',
    description: 'Organic light leak overlays',
    category: 'stylize',
    icon: 'sunrise',
    parameters: {
      amount: { min: 0, max: 100, default: 30, step: 1 },
      warmth: { min: -100, max: 100, default: 50, step: 1 },
      frequency: { min: 0.1, max: 3, default: 0.5, step: 0.1 },
    },
  },
  // Vintage Effects
  {
    id: 'vhs_effect',
    name: 'VHS Effect',
    description: 'Analog VHS tape degradation',
    category: 'vintage',
    icon: 'tv',
    parameters: {
      tracking: { min: 0, max: 100, default: 30, step: 1 },
      colorBleed: { min: 0, max: 100, default: 40, step: 1 },
      noise: { min: 0, max: 100, default: 20, step: 1 },
      scanlines: { min: 0, max: 100, default: 10, step: 1 },
    },
  },
  {
    id: 'super_8',
    name: 'Super 8',
    description: '8mm film aesthetic',
    category: 'vintage',
    icon: 'film',
    parameters: {
      grain: { min: 0, max: 100, default: 60, step: 1 },
      flicker: { min: 0, max: 100, default: 30, step: 1 },
      vignette: { min: 0, max: 100, default: 50, step: 1 },
      scratches: { min: 0, max: 100, default: 20, step: 1 },
    },
  },
];

// ============================================
// LOOK PRESETS (ONE-CLICK STYLES)
// ============================================

export interface LookPreset {
  id: string;
  name: string;
  description: string;
  category: 'cinematic' | 'music_video' | 'vintage' | 'commercial' | 'social';
  thumbnail: string;
  colorGrade: string;
  effects: { effectId: string; values: Record<string, number> }[];
}

export const LOOK_PRESETS: LookPreset[] = [
  {
    id: 'cinematic_film',
    name: 'Cinematic Film',
    description: 'Hollywood blockbuster aesthetic',
    category: 'cinematic',
    thumbnail: 'cinematic-film',
    colorGrade: 'teal_orange',
    effects: [
      { effectId: 'film_grain', values: { amount: 20, size: 1.2, roughness: 40 } },
      { effectId: 'letterbox', values: { ratio: 2.39, opacity: 100 } },
      { effectId: 'vignette', values: { amount: 25, midpoint: 50, roundness: 0, feather: 60 } },
      { effectId: 'halation', values: { amount: 15, threshold: 75, size: 25 } },
    ],
  },
  {
    id: 'music_video_hype',
    name: 'Music Video Hype',
    description: 'High energy music video style',
    category: 'music_video',
    thumbnail: 'mv-hype',
    colorGrade: 'vibrant_pop',
    effects: [
      { effectId: 'glow', values: { amount: 25, threshold: 50, radius: 60 } },
      { effectId: 'zoom_pulse', values: { amount: 3, frequency: 2 } },
      { effectId: 'light_leaks', values: { amount: 20, warmth: 30, frequency: 0.3 } },
    ],
  },
  {
    id: 'vintage_vhs',
    name: 'Vintage VHS',
    description: '80s/90s VHS tape aesthetic',
    category: 'vintage',
    thumbnail: 'vhs-vintage',
    colorGrade: 'vintage_film',
    effects: [
      { effectId: 'vhs_effect', values: { tracking: 40, colorBleed: 50, noise: 30, scanlines: 15 } },
      { effectId: 'vignette', values: { amount: 40, midpoint: 40, roundness: -20, feather: 70 } },
    ],
  },
  {
    id: 'luxury_commercial',
    name: 'Luxury Commercial',
    description: 'High-end brand commercial style',
    category: 'commercial',
    thumbnail: 'luxury-commercial',
    colorGrade: 'clean_natural',
    effects: [
      { effectId: 'glow', values: { amount: 10, threshold: 70, radius: 40 } },
      { effectId: 'vignette', values: { amount: 15, midpoint: 60, roundness: 0, feather: 80 } },
    ],
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Clean professional documentary look',
    category: 'commercial',
    thumbnail: 'documentary',
    colorGrade: 'clean_natural',
    effects: [
      { effectId: 'film_grain', values: { amount: 8, size: 0.8, roughness: 30 } },
    ],
  },
  {
    id: 'tiktok_viral',
    name: 'TikTok Viral',
    description: 'Trendy social media aesthetic',
    category: 'social',
    thumbnail: 'tiktok-viral',
    colorGrade: 'vibrant_pop',
    effects: [
      { effectId: 'glow', values: { amount: 20, threshold: 45, radius: 50 } },
      { effectId: 'zoom_pulse', values: { amount: 4, frequency: 3 } },
    ],
  },
];