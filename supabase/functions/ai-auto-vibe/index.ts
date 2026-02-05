import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VibeAnalysis {
  detectedGenre: string;
  suggestedStyle: string;
  suggestedColorGrade: string;
  suggestedEffects: string;
  suggestedTransitions: string[];
  suggestedBeatRules: string[];
  directorIntent: string;
  confidence: number;
  reasoning: string;
  vibeKeywords: string[];
  energyProfile: 'low' | 'medium' | 'high' | 'dynamic';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, userDescription, detectedBPM, sceneCount } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert video editor AI that analyzes video/audio content and suggests the perfect editing style, color grading, and effects.

AVAILABLE OPTIONS:
Styles: cinematic, music_video_hype, social_tiktok, commercial_clean, concert_multicam
LUTs: teal-orange, golden-hour, cyberpunk-city, neon-nights, vhs-retro, kodak-gold, fuji-velvia, instagram-fade, moody-desat, vibrant-pop, noir-detective, bleach-bypass, blockbuster, nordic-cold, autumn-warm, dreamy-wedding, romance-soft, thriller-cold, horror-teal, scifi-green, deep-ocean, tropical-vibrant, desert-orange, sepia-western, chiaroscuro, polaroid-fade, bw-classic, clean-natural, beach-summer
Effects: minimal, balanced, cinematic_heavy, music_video, social_viral
Transitions: cut_on_beat, whip_pan, zoom_punch, glitch_transition, light_leak, motion_blur
Beat Rules: cut_on_beat, transition_on_downbeat, speed_ramp_on_drop, hold_on_chorus

ENERGY PROFILES:
- low: chill, ambient, emotional, ballad
- medium: pop, indie, steady energy
- high: hype, EDM drops, intense action
- dynamic: varies throughout, builds and releases

Analyze the content and suggest the optimal configuration for the best possible edit.`;

    const userPrompt = `Analyze this content and suggest the perfect vibe configuration:

File: ${fileName || 'Unknown'}
Type: ${fileType || 'video'}
User Description: ${userDescription || 'No description provided'}
Detected BPM: ${detectedBPM || 'Unknown'}
Scene Count: ${sceneCount || 'Unknown'}

Provide your analysis and recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_vibe",
              description: "Suggest the optimal editing vibe configuration",
              parameters: {
                type: "object",
                properties: {
                  detectedGenre: { type: "string", description: "Detected music/video genre" },
                  suggestedStyle: { type: "string", enum: ["cinematic", "music_video_hype", "social_tiktok", "commercial_clean", "concert_multicam"] },
                  suggestedColorGrade: { type: "string" },
                  suggestedEffects: { type: "string", enum: ["minimal", "balanced", "cinematic_heavy", "music_video", "social_viral"] },
                  suggestedTransitions: { type: "array", items: { type: "string" } },
                  suggestedBeatRules: { type: "array", items: { type: "string" } },
                  directorIntent: { type: "string", description: "One-word vibe/mood descriptor" },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  reasoning: { type: "string", description: "Brief explanation of why these choices work" },
                  vibeKeywords: { type: "array", items: { type: "string" }, description: "3-5 keywords describing the vibe" },
                  energyProfile: { type: "string", enum: ["low", "medium", "high", "dynamic"] }
                },
                required: ["suggestedStyle", "suggestedColorGrade", "suggestedEffects", "directorIntent", "confidence", "reasoning", "energyProfile"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_vibe" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ success: true, analysis: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({
      success: true,
      analysis: {
        detectedGenre: "general",
        suggestedStyle: "cinematic",
        suggestedColorGrade: "teal-orange",
        suggestedEffects: "balanced",
        suggestedTransitions: ["cut_on_beat", "whip_pan"],
        suggestedBeatRules: ["cut_on_beat", "transition_on_downbeat"],
        directorIntent: "energetic",
        confidence: 0.7,
        reasoning: "Default cinematic style with balanced effects for versatile editing",
        vibeKeywords: ["professional", "dynamic", "modern"],
        energyProfile: "medium"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Auto vibe error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Analysis failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
