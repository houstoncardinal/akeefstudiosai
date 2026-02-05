 export interface EditPreset {
   id: string;
   name: string;
   description: string;
   defaultRules: string;
 }
 
 export const EDIT_PRESETS: EditPreset[] = [
   {
     id: 'music_video_rough_cut',
     name: 'Music Video',
     description: 'Beat-synced cuts with dynamic pacing for music videos',
     defaultRules: `EDIT STYLE: Music Video Professional Grade
 
 TIMING RULES:
 - Primary cuts sync to downbeats and snare hits
 - Secondary cuts on hi-hats during verse sections
 - Hold shots 0.5-2 seconds during high energy sections
 - Extend to 3-4 seconds for emotional verse moments
 - Accelerate cuts 20% leading into chorus drops
 
 SHOT SELECTION:
 - Prioritize performer close-ups on vocal hooks
 - Wide establishing shots for intro/outro
 - Dynamic movement shots during instrumental breaks
 - Match shot energy to audio dynamics
 - Favor shots with natural motion blur on transitions
 
 SEQUENCE FLOW:
 - Build intensity through verse → pre-chorus → chorus
 - Reset energy at bridge sections
 - Use jump cuts sparingly for emphasis only
 - Maintain visual rhythm consistency within sections`,
   },
   {
     id: 'hyper_vibe_quick_cuts',
     name: 'Hyper Cuts',
     description: 'TikTok/Reels style ultra-fast edits with maximum energy',
     defaultRules: `EDIT STYLE: Hyper-Kinetic Social Media
 
 TIMING RULES:
 - Maximum clip duration: 0.8 seconds
 - Minimum clip duration: 0.2 seconds (6 frames)
 - Never hold static shots beyond 0.5 seconds
 - Cut on ANY motion or energy peak
 
 SHOT SELECTION:
 - ONLY use clips with visible movement
 - Prioritize: action, gestures, expressions, camera motion
 - Remove ALL static or slow footage completely
 - Favor whip pans, zooms, and motion blur moments
 
 PATTERN RULES:
 - Create repetitive visual rhythms (A-B-A-B patterns)
 - Use triplet sequences for emphasis
 - Build speed toward climax points
 - Reset with 1-second breather every 8-10 cuts`,
   },
   {
     id: 'clean_story_cut',
     name: 'Narrative',
     description: 'Professional story-driven editing with proper pacing',
     defaultRules: `EDIT STYLE: Narrative Documentary/Film
 
 TIMING RULES:
 - Standard shots: 3-5 seconds
 - Establishing shots: 4-6 seconds
 - Reaction shots: 2-3 seconds
 - Action sequences: 1.5-3 seconds
 - Allow 0.5s breathing room between scene changes
 
 CONTINUITY RULES:
 - Maintain 180-degree rule strictly
 - Follow action-reaction-action patterns
 - Match eyelines and screen direction
 - Preserve all dialogue completely
 - Maintain audio continuity
 
 SEQUENCE STRUCTURE:
 - Start scenes with wide establishing shots
 - Move to medium shots for context
 - Use close-ups for emotional emphasis
 - Return to wides for scene transitions
 - End sequences with definitive closing shots`,
   },
   {
     id: 'concert_multicam_fast_switch',
     name: 'Live Concert',
     description: 'Multi-camera live performance with pro switching',
     defaultRules: `EDIT STYLE: Live Concert Multicam
 
 MUSICAL TIMING:
 - Camera switches every 2-4 bars (8-16 beats)
 - Cut on phrase changes and section transitions
 - Accelerate switching during guitar solos/breakdowns
 - Hold hero shots during vocal hooks
 
 CAMERA PRIORITY:
 1. Performer close-ups during vocals/solos
 2. Wide shots for crowd shots and energy moments
 3. Instrument close-ups during technical passages
 4. Side angles for variety
 5. Crowd reactions for audience connection
 
 ENERGY MATCHING:
 - Slow songs: longer holds, subtle switches
 - High energy: rapid 1-2 bar switches
 - Builds: accelerate cut rate toward drops
 - Breakdowns: hold wide or performer close-up`,
   },
   {
     id: 'broll_montage_inserts',
     name: 'B-Roll Montage',
     description: 'Visual storytelling with cinematic B-roll sequences',
     defaultRules: `EDIT STYLE: Documentary B-Roll Montage
 
 CLIP DURATION:
 - Standard clips: 2-4 seconds
 - Detail shots: 1.5-2.5 seconds
 - Landscape/establishing: 3-5 seconds
 - Motion shots: match action duration
 
 VISUAL GROUPING:
 - Group thematically similar shots together
 - Create location-based clusters
 - Vary shot sizes within groups (wide-med-close)
 - Transition between themes with neutral shots
 
 SEQUENCE BUILDING:
 - Open sequences with context shots
 - Build toward detail and emotion
 - End sequences with definitive moments
 - Leave natural gaps for voiceover placement
 
 MOTION PRIORITY:
 - Favor shots with natural movement
 - Use static shots as breathers only
 - Match movement direction between cuts
 - Prioritize visual interest and depth`,
   },
 ];
 
 export const AI_MODELS = [
   { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fastest • Recommended for most projects' },
   { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most powerful • Complex timelines' },
   { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced speed and quality' },
   { id: 'openai/gpt-5', name: 'GPT-5', description: 'High accuracy • Premium quality' },
   { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient' },
 ];