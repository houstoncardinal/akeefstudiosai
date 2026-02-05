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
  category: 'hollywood' | 'film_stock' | 'stylized' | 'broadcast' | 'music_video';
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