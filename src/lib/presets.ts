 export interface EditPreset {
   id: string;
   name: string;
   description: string;
   defaultRules: string;
 }
 
 export const EDIT_PRESETS: EditPreset[] = [
   {
     id: 'music_video_rough_cut',
     name: 'Music Video Rough Cut',
     description: 'Beat-synced cuts with dynamic pacing for music videos',
     defaultRules: `- Cut on beat drops and musical accents
 - Favor quick cuts (0.5-2 seconds) during high energy sections
 - Hold longer on verses for visual storytelling
 - Alternate between wide and close-up shots
 - Match visual intensity to audio energy levels
 - Use jump cuts sparingly for emphasis`,
   },
   {
     id: 'hyper_vibe_quick_cuts',
     name: 'Hyper Vibe Quick Cuts',
     description: 'Fast-paced, energetic editing with rapid transitions',
     defaultRules: `- Maximum cut frequency: 0.3-1 second per clip
 - Favor dynamic movement and action shots
 - Remove all static or slow footage
 - Create visual rhythm through repetitive patterns
 - Use whip pans and motion blur moments
 - Prioritize high-energy frames`,
   },
   {
     id: 'clean_story_cut',
     name: 'Clean Story Cut',
     description: 'Narrative-focused editing with proper pacing',
     defaultRules: `- Maintain narrative continuity and logical flow
 - Use standard 3-5 second shot lengths
 - Preserve dialogue and important audio
 - Follow the 180-degree rule
 - Include establishing shots before close-ups
 - Allow breathing room between scenes`,
   },
   {
     id: 'concert_multicam_fast_switch',
     name: 'Concert Multicam Fast Switch',
     description: 'Live performance editing with camera switching',
     defaultRules: `- Switch cameras on musical phrases (every 2-4 bars)
 - Favor performer close-ups during vocals/solos
 - Cut to wide shots for crowd moments
 - Match energy of performance to cut frequency
 - Prioritize angles with best lighting
 - Sync major switches to song sections`,
   },
   {
     id: 'broll_montage_inserts',
     name: 'B-Roll Montage Inserts',
     description: 'Creative B-roll assembly for documentary style',
     defaultRules: `- Create visual variety through diverse angles
 - Use 2-4 second clips for rhythm
 - Group thematically similar shots together
 - Build sequences from wide to tight
 - Leave gaps for voiceover or music placement
 - Prioritize movement and visual interest`,
   },
 ];
 
 export const AI_MODELS = [
   { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash (Recommended)', description: 'Fast and capable' },
   { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most powerful, complex reasoning' },
   { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced speed and quality' },
   { id: 'openai/gpt-5', name: 'GPT-5', description: 'Excellent accuracy' },
   { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient' },
 ];