// ============================================
// AKEEF STUDIO AI - Universal Video Format Support
// ============================================

export interface VideoFormat {
  id: string;
  name: string;
  extension: string;
  mimeTypes: string[];
  codec: string;
  category: 'professional' | 'consumer' | 'web' | 'raw' | 'timeline';
  maxResolution: string;
  features: string[];
  description: string;
  icon: string;
  color: string;
}

export const VIDEO_FORMATS: VideoFormat[] = [
  // Timeline/Project Files
  {
    id: 'fcpxml',
    name: 'Final Cut Pro XML',
    extension: '.fcpxml',
    mimeTypes: ['application/xml', 'text/xml'],
    codec: 'Timeline',
    category: 'timeline',
    maxResolution: 'Any',
    features: ['timeline_editing', 'effects', 'transitions', 'color_grading', 'multicam'],
    description: 'Native Final Cut Pro project format',
    icon: 'film',
    color: 'hsl(280, 100%, 60%)',
  },
  {
    id: 'premiere_xml',
    name: 'Premiere Pro XML',
    extension: '.prproj',
    mimeTypes: ['application/xml', 'text/xml'],
    codec: 'Timeline',
    category: 'timeline',
    maxResolution: 'Any',
    features: ['timeline_editing', 'effects', 'transitions', 'lumetri'],
    description: 'Adobe Premiere Pro exchange format',
    icon: 'clapperboard',
    color: 'hsl(290, 90%, 50%)',
  },
  // Professional Formats
  {
    id: 'prores',
    name: 'Apple ProRes',
    extension: '.mov',
    mimeTypes: ['video/quicktime'],
    codec: 'ProRes 422/4444',
    category: 'professional',
    maxResolution: '8K',
    features: ['hdr_support', 'alpha_channel', 'high_bitrate', 'low_cpu_editing'],
    description: 'Industry-standard for post-production',
    icon: 'crown',
    color: 'hsl(45, 100%, 50%)',
  },
  {
    id: 'mov',
    name: 'QuickTime MOV',
    extension: '.mov',
    mimeTypes: ['video/quicktime'],
    codec: 'Various',
    category: 'professional',
    maxResolution: '8K',
    features: ['multi_track', 'timecode', 'metadata', 'alpha_support'],
    description: 'Versatile container format',
    icon: 'video',
    color: 'hsl(210, 100%, 50%)',
  },
  {
    id: 'hevc',
    name: 'HEVC/H.265',
    extension: '.mp4',
    mimeTypes: ['video/mp4', 'video/hevc'],
    codec: 'H.265/HEVC',
    category: 'professional',
    maxResolution: '8K',
    features: ['hdr10', 'dolby_vision', 'high_compression', '10bit_color'],
    description: 'High-efficiency codec for 4K/8K',
    icon: 'zap',
    color: 'hsl(160, 100%, 45%)',
  },
  {
    id: 'mp4',
    name: 'MP4/H.264',
    extension: '.mp4',
    mimeTypes: ['video/mp4'],
    codec: 'H.264/AVC',
    category: 'consumer',
    maxResolution: '4K',
    features: ['universal_playback', 'streaming', 'web_optimized'],
    description: 'Universal delivery format',
    icon: 'play',
    color: 'hsl(200, 90%, 50%)',
  },
  {
    id: 'mxf',
    name: 'MXF Professional',
    extension: '.mxf',
    mimeTypes: ['application/mxf', 'video/mxf'],
    codec: 'Various',
    category: 'professional',
    maxResolution: '8K',
    features: ['broadcast_standard', 'timecode', 'multi_track', 'metadata'],
    description: 'Broadcast & cinema standard',
    icon: 'tv',
    color: 'hsl(0, 100%, 60%)',
  },
  {
    id: 'webm',
    name: 'WebM',
    extension: '.webm',
    mimeTypes: ['video/webm'],
    codec: 'VP9/AV1',
    category: 'web',
    maxResolution: '4K',
    features: ['web_native', 'alpha_support', 'royalty_free'],
    description: 'Optimized for web delivery',
    icon: 'globe',
    color: 'hsl(40, 100%, 50%)',
  },
  {
    id: 'avi',
    name: 'AVI',
    extension: '.avi',
    mimeTypes: ['video/avi', 'video/x-msvideo'],
    codec: 'Various',
    category: 'consumer',
    maxResolution: '4K',
    features: ['legacy_support', 'uncompressed_option'],
    description: 'Legacy format with wide support',
    icon: 'file-video',
    color: 'hsl(180, 60%, 50%)',
  },
  {
    id: 'mkv',
    name: 'Matroska MKV',
    extension: '.mkv',
    mimeTypes: ['video/x-matroska'],
    codec: 'Various',
    category: 'consumer',
    maxResolution: '8K',
    features: ['multi_audio', 'subtitles', 'chapters', 'high_compatibility'],
    description: 'Feature-rich container format',
    icon: 'package',
    color: 'hsl(270, 70%, 55%)',
  },
  {
    id: 'braw',
    name: 'Blackmagic RAW',
    extension: '.braw',
    mimeTypes: ['application/octet-stream'],
    codec: 'BRAW',
    category: 'raw',
    maxResolution: '12K',
    features: ['raw_grading', 'high_dynamic_range', 'iso_recovery', 'color_science'],
    description: 'Cinema camera RAW format',
    icon: 'aperture',
    color: 'hsl(340, 100%, 50%)',
  },
  {
    id: 'r3d',
    name: 'RED RAW (R3D)',
    extension: '.r3d',
    mimeTypes: ['application/octet-stream'],
    codec: 'REDCODE',
    category: 'raw',
    maxResolution: '8K',
    features: ['raw_grading', 'extreme_dynamic_range', 'high_framerate'],
    description: 'RED camera native format',
    icon: 'target',
    color: 'hsl(0, 100%, 50%)',
  },
  {
    id: 'arri',
    name: 'ARRI RAW',
    extension: '.ari',
    mimeTypes: ['application/octet-stream'],
    codec: 'ARRIRAW',
    category: 'raw',
    maxResolution: '6.5K',
    features: ['raw_grading', 'log_c', 'wide_gamut', 'cinema_grade'],
    description: 'ARRI Alexa native format',
    icon: 'camera',
    color: 'hsl(45, 90%, 55%)',
  },
  {
    id: 'dnxhd',
    name: 'Avid DNxHD/HR',
    extension: '.mxf',
    mimeTypes: ['application/mxf', 'video/mxf'],
    codec: 'DNxHD/DNxHR',
    category: 'professional',
    maxResolution: '8K',
    features: ['avid_native', 'high_quality', 'fast_rendering'],
    description: 'Avid-optimized intermediate',
    icon: 'layers',
    color: 'hsl(250, 80%, 60%)',
  },
  {
    id: 'cineform',
    name: 'GoPro CineForm',
    extension: '.mov',
    mimeTypes: ['video/quicktime'],
    codec: 'CineForm',
    category: 'professional',
    maxResolution: '8K',
    features: ['intermediate_codec', 'fast_decode', 'quality_options'],
    description: 'Professional intermediate codec',
    icon: 'mountain',
    color: 'hsl(220, 80%, 50%)',
  },
];

// Format-specific tools and capabilities
export interface FormatTool {
  id: string;
  name: string;
  description: string;
  applicableFormats: string[];
  category: 'color' | 'codec' | 'optimization' | 'repair' | 'analysis' | 'ai';
  icon: string;
  isPro?: boolean;
}

export const FORMAT_TOOLS: FormatTool[] = [
  {
    id: 'prores_proxy_gen',
    name: 'ProRes Proxy Generator',
    description: 'Create lightweight editing proxies',
    applicableFormats: ['prores', 'mov', 'braw', 'r3d', 'arri', 'hevc'],
    category: 'optimization',
    icon: 'copy',
  },
  {
    id: 'hevc_hdr_extract',
    name: 'HDR Metadata Extractor',
    description: 'Extract HDR10/Dolby Vision metadata',
    applicableFormats: ['hevc', 'mp4', 'mov', 'mkv'],
    category: 'analysis',
    icon: 'sun',
  },
  {
    id: 'raw_debayer',
    name: 'RAW Debayer Settings',
    description: 'Configure color science and ISO',
    applicableFormats: ['braw', 'r3d', 'arri'],
    category: 'color',
    icon: 'palette',
    isPro: true,
  },
  {
    id: 'codec_transcode',
    name: 'Smart Transcode',
    description: 'Optimize codec for editing performance',
    applicableFormats: ['mp4', 'avi', 'webm', 'hevc', 'mkv'],
    category: 'codec',
    icon: 'refresh-cw',
  },
  {
    id: 'timecode_repair',
    name: 'Timecode Repair',
    description: 'Fix broken or missing timecode',
    applicableFormats: ['mov', 'mxf', 'prores', 'dnxhd'],
    category: 'repair',
    icon: 'clock',
  },
  {
    id: 'multicam_sync',
    name: 'Multi-Cam Audio Sync',
    description: 'Sync multiple angles by audio waveform',
    applicableFormats: ['fcpxml', 'premiere_xml', 'mov', 'mp4', 'hevc', 'prores'],
    category: 'analysis',
    icon: 'camera',
  },
  {
    id: 'scene_detection',
    name: 'AI Scene Detection',
    description: 'Automatically detect scene changes',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'webm', 'avi', 'mkv'],
    category: 'ai',
    icon: 'scan',
  },
  {
    id: 'audio_extraction',
    name: 'Audio Stem Extraction',
    description: 'AI-separate dialogue, music, and SFX',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'mxf', 'mkv', 'avi'],
    category: 'ai',
    icon: 'music',
    isPro: true,
  },
  {
    id: 'stabilization',
    name: 'AI Stabilization',
    description: 'Remove camera shake with AI warp',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'webm', 'mkv'],
    category: 'ai',
    icon: 'move',
  },
  {
    id: 'upscale_enhance',
    name: 'AI Upscale & Enhance',
    description: 'Upscale to 4K/8K with neural networks',
    applicableFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
    category: 'ai',
    icon: 'maximize',
    isPro: true,
  },
  {
    id: 'noise_reduction',
    name: 'AI Noise Reduction',
    description: 'Remove grain and noise preserving detail',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'braw', 'r3d'],
    category: 'ai',
    icon: 'sparkles',
    isPro: true,
  },
  {
    id: 'object_tracking',
    name: 'AI Object Tracking',
    description: 'Track objects for effects and masks',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'mkv'],
    category: 'ai',
    icon: 'crosshair',
  },
  {
    id: 'face_detection',
    name: 'Face Detection & Tracking',
    description: 'Detect and track faces for reframing',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'mkv', 'webm'],
    category: 'ai',
    icon: 'user',
  },
  {
    id: 'auto_color',
    name: 'AI Color Match',
    description: 'Match colors across different shots',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'braw', 'r3d', 'arri'],
    category: 'color',
    icon: 'droplet',
  },
  {
    id: 'frame_interpolation',
    name: 'AI Frame Interpolation',
    description: 'Generate slow-motion up to 240fps',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'mkv'],
    category: 'ai',
    icon: 'fast-forward',
    isPro: true,
  },
  {
    id: 'background_removal',
    name: 'AI Background Removal',
    description: 'Remove or replace video backgrounds',
    applicableFormats: ['mp4', 'mov', 'hevc', 'prores', 'webm'],
    category: 'ai',
    icon: 'eraser',
    isPro: true,
  },
];

// Helper function to get applicable tools for a format
export function getToolsForFormat(formatId: string): FormatTool[] {
  return FORMAT_TOOLS.filter(tool => tool.applicableFormats.includes(formatId));
}

// Helper to detect format from file
export function detectVideoFormat(file: File): VideoFormat | null {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const mimeType = file.type;
  
  // Special detection for specific extensions
  if (ext === 'fcpxml') return VIDEO_FORMATS.find(f => f.id === 'fcpxml') || null;
  if (ext === 'braw') return VIDEO_FORMATS.find(f => f.id === 'braw') || null;
  if (ext === 'r3d') return VIDEO_FORMATS.find(f => f.id === 'r3d') || null;
  if (ext === 'ari') return VIDEO_FORMATS.find(f => f.id === 'arri') || null;
  if (ext === 'mkv') return VIDEO_FORMATS.find(f => f.id === 'mkv') || null;
  if (ext === 'webm') return VIDEO_FORMATS.find(f => f.id === 'webm') || null;
  if (ext === 'mxf') return VIDEO_FORMATS.find(f => f.id === 'mxf') || null;
  if (ext === 'avi') return VIDEO_FORMATS.find(f => f.id === 'avi') || null;
  
  // Check by extension
  const byExt = VIDEO_FORMATS.find(f => f.extension === `.${ext}`);
  if (byExt) return byExt;
  
  // Check by mime type
  const byMime = VIDEO_FORMATS.find(f => f.mimeTypes.includes(mimeType));
  if (byMime) return byMime;
  
  // Default to MP4 for unknown video types
  if (mimeType.startsWith('video/')) {
    return VIDEO_FORMATS.find(f => f.id === 'mp4') || null;
  }
  
  return null;
}

// Get all supported file extensions
export function getAllSupportedExtensions(): string[] {
  const extensions = new Set<string>();
  VIDEO_FORMATS.forEach(f => extensions.add(f.extension));
  // Add additional extensions
  extensions.add('.fcpxml');
  extensions.add('.braw');
  extensions.add('.r3d');
  extensions.add('.ari');
  extensions.add('.mkv');
  return Array.from(extensions);
}

// Get accept object for dropzone
export function getDropzoneAccept(): Record<string, string[]> {
  return {
    'video/*': ['.mov', '.mp4', '.avi', '.webm', '.mxf', '.mkv', '.m4v', '.mpg', '.mpeg', '.wmv', '.flv', '.3gp', '.3g2', '.ts', '.mts', '.m2ts', '.vob', '.ogv', '.f4v', '.asf', '.divx', '.dv', '.rm', '.rmvb'],
    'video/quicktime': ['.mov'],
    'video/mp4': ['.mp4', '.m4v'],
    'video/x-msvideo': ['.avi'],
    'video/webm': ['.webm'],
    'video/x-matroska': ['.mkv'],
    'video/x-ms-wmv': ['.wmv'],
    'video/x-flv': ['.flv'],
    'video/3gpp': ['.3gp', '.3g2'],
    'video/mp2t': ['.ts', '.mts', '.m2ts'],
    'application/xml': ['.fcpxml', '.xml'],
    'text/xml': ['.fcpxml', '.xml'],
    'application/octet-stream': ['.braw', '.r3d', '.ari', '.fcpxml'],
    'application/mxf': ['.mxf'],
    'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
  };
}

// Categorized format lists for UI
export const FORMAT_CATEGORIES = {
  timeline: VIDEO_FORMATS.filter(f => f.category === 'timeline'),
  professional: VIDEO_FORMATS.filter(f => f.category === 'professional'),
  raw: VIDEO_FORMATS.filter(f => f.category === 'raw'),
  consumer: VIDEO_FORMATS.filter(f => f.category === 'consumer'),
  web: VIDEO_FORMATS.filter(f => f.category === 'web'),
};