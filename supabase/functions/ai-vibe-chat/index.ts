import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentConfig, mode } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are AKEEF AI, the world's most advanced AI video editing assistant. You help creators make stunning music videos, social content, and cinematic edits with natural language.

PERSONALITY: You're creative, enthusiastic, and deeply knowledgeable about video editing, color grading, cinematography, and music video aesthetics. You speak like a professional editor who loves their craft.

CAPABILITIES - You can help users with:
1. **Vibe Selection**: Suggest perfect styles (cinematic, music_video_hype, social_tiktok, etc.)
2. **Color Grading**: Recommend LUTs (teal-orange, cyberpunk, golden-hour, vhs-retro, etc.)
3. **Effects**: Suggest effect presets (minimal, balanced, cinematic_heavy, music_video, etc.)
4. **Beat Sync**: Configure beat-synced cuts, transitions, energy-based pacing
5. **Director Intent**: Capture the emotional/creative vision (hype, dreamy, dark, nostalgic, etc.)
6. **Transitions**: Pick transition styles for different moods
7. **Music Video Specifics**: Understand genres (hip-hop, pop, rock, electronic) and match edits to music energy

CURRENT PROJECT CONFIG:
${currentConfig ? JSON.stringify(currentConfig, null, 2) : 'No config loaded yet'}

RESPONSE STYLE:
- Be conversational but efficient
- When suggesting changes, explain WHY they work for the vibe
- Use emojis sparingly for energy ✨🎬🔥
- Always offer to apply changes directly
- For music videos, reference genre-specific techniques

When you want to suggest configuration changes, include them in your response using this format:
[APPLY_CONFIG]{"style": "...", "colorGrade": "...", "effectPreset": "...", "directorIntent": "..."}[/APPLY_CONFIG]

Only include the fields that should change. The user can click to apply your suggestions instantly.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI request failed");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI vibe chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Chat failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
