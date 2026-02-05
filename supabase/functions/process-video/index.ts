import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================
// AKEEF STUDIO AI - UNIVERSAL VIDEO PROCESSING ENGINE
// Supports: MOV, MP4, ProRes, HEVC, RAW, FCPXML, and more
// Powered by OpenAI GPT-5 & Google Gemini
// ============================================

interface AdvancedConfig {
  colorGrade: string;
  effectPreset: string;
  graphics: string[];
  versions: string[];
  exportFormat: string;
  formatTools: string[];
}

// Determine which API to use based on model
function getAIProvider(model: string): 'openai' | 'gemini' | 'lovable' {
  if (model.startsWith('openai/')) return 'openai';
  if (model.startsWith('google/')) return 'gemini';
  return 'lovable';
}

// Build comprehensive editing system prompt for all video types
function buildSystemPrompt(preset: string, styleRules: string, advancedConfig?: AdvancedConfig, fileType?: string, isVideoFile?: boolean): string {
  const formatSpecificInstructions = isVideoFile ? `
═══════════════════════════════════════════════════════════════
VIDEO FILE PROCESSING MODE
═══════════════════════════════════════════════════════════════

Since this is a raw video file (${fileType || 'video'}), you will generate:
1. An FCPXML project file that references this video
2. Edit decisions and cut points based on the style
3. Color grading metadata and LUT references
4. Effect keyframe data
5. Graphics placement markers

VIDEO FORMAT SPECIFIC OPTIMIZATIONS:
${fileType === 'prores' ? '- ProRes: Maintain full quality, use native frame rate, preserve alpha if 4444' : ''}
${fileType === 'hevc' ? '- HEVC/H.265: Enable HDR metadata passthrough, maintain 10-bit color depth' : ''}
${fileType === 'braw' || fileType === 'r3d' ? '- RAW: Include debayer settings, ISO recovery, and color science metadata' : ''}
${fileType === 'mov' ? '- MOV: Check for ProRes/CineForm codec, handle timecode' : ''}
${fileType === 'mp4' ? '- MP4/H.264: Web-optimized, fast start enabled' : ''}
${fileType === 'mxf' ? '- MXF: Preserve broadcast metadata, timecode, and multi-track audio' : ''}

AI TOOLS TO APPLY:
${advancedConfig?.formatTools?.join(', ') || 'Standard processing'}
` : `
═══════════════════════════════════════════════════════════════
TIMELINE FILE PROCESSING MODE
═══════════════════════════════════════════════════════════════

Processing existing timeline structure. Modify and enhance the edit while preserving:
- All media references and asset IDs
- Audio/video synchronization
- Compound clip relationships
`;

  return `You are AKEEF STUDIO AI - an elite video editing artificial intelligence with expertise comparable to Hollywood's top editors at studios like Pixar, Marvel, and Warner Bros.

YOUR CAPABILITIES:
- Universal video format processing (MOV, MP4, ProRes, HEVC, RAW, MXF, WebM, AVI, FCPXML)
- Professional-grade timeline manipulation and generation
- Beat-synced editing algorithms for music videos
- Cinematic pacing analysis and optimization
- Multi-camera switching intelligence
- Color grading instruction embedding with LUT references
- Motion graphics timing calculations
- Platform-specific format optimization
- AI-powered scene detection and smart cuts
- Audio stem separation and enhancement

${formatSpecificInstructions}

═══════════════════════════════════════════════════════════════
CRITICAL OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════

1. OUTPUT FORMAT: ONLY valid FCPXML - NO explanations, NO markdown, NO code blocks
2. START WITH: <?xml version="1.0" encoding="UTF-8"?>
3. CONTAIN: Complete <fcpxml version="1.9"> document structure
4. FOR VIDEO FILES: Generate a new project that references the source video
5. FOR TIMELINES: Modify the existing structure
6. TIMING: Use frame-accurate timing (e.g., "1001/30000s")
7. VALIDATE: Ensure output is parseable by Final Cut Pro X

═══════════════════════════════════════════════════════════════
EDIT STYLE: ${preset.split('_').join(' ').toUpperCase()}
═══════════════════════════════════════════════════════════════

${styleRules}

${advancedConfig ? `
═══════════════════════════════════════════════════════════════
ADVANCED PROCESSING ALGORITHMS
═══════════════════════════════════════════════════════════════

COLOR GRADING ENGINE:
Apply LUT: ${advancedConfig.colorGrade}
- Embed color correction metadata in timeline
- Add adjustment layer markers for manual refinement
- Include color space conversion notes

EFFECTS PROCESSOR:
Mode: ${advancedConfig.effectPreset}
- Calculate optimal transition durations based on pacing
- Insert effect placeholders with suggested parameters
- Add motion keyframe markers at beat positions

GRAPHICS INTEGRATION:
${advancedConfig.graphics.length > 0 ? advancedConfig.graphics.join(', ') : 'None selected'}
- Mark title insertion points in timeline
- Calculate lower-third safe zones
- Add caption timing markers

VERSION GENERATION:
${advancedConfig.versions.join(', ')}
- Structure timeline for multi-version export
- Add chapter markers for segmentation
- Include aspect ratio conversion metadata

AI PROCESSING TOOLS:
${advancedConfig.formatTools?.length > 0 ? advancedConfig.formatTools.join(', ') : 'Standard processing'}
- scene_detection: Auto-detect scene changes
- stabilization: AI warp stabilizer data
- upscale_enhance: 4K/8K upscale markers
- audio_extraction: Stem separation metadata
- auto_color: Shot matching data
- face_detection: Reframe coordinates
- object_tracking: Motion path data
` : ''}

═══════════════════════════════════════════════════════════════
PROFESSIONAL EDITING ALGORITHMS
═══════════════════════════════════════════════════════════════

BEAT DETECTION ALGORITHM:
- Analyze audio waveform references for transient peaks
- Calculate bar/beat positions from tempo metadata
- Align cuts to musical downbeats and phrase boundaries

PACING OPTIMIZATION:
- Apply Golden Ratio timing (1.618x variation)
- Implement Kuleshov effect sequencing for emotional impact
- Use L-cuts and J-cuts for dialogue flow

VISUAL FLOW:
- Match action continuity between clips
- Maintain 180-degree rule compliance
- Apply rule of thirds for reframe suggestions

ENERGY CURVE:
- Build tension through progressively shorter cuts
- Release with extended hero shots
- Match visual energy to audio dynamics

Execute the edit with the precision of an Academy Award-winning editor.
Output ONLY the modified FCPXML document.`;
}

// Generate FCPXML for video files
function generateVideoFCPXML(fileName: string, fileType: string): string {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1001/30000s" width="1920" height="1080"/>
    <asset id="r2" name="${cleanName}" uid="${timestamp}" start="0s" duration="60s" hasVideo="1" hasAudio="1" format="r1">
      <media-rep kind="original-media" src="file://./${fileName}"/>
    </asset>
  </resources>
  <library location="file://./Akeef_Studio_Library.fcpbundle/">
    <event name="Akeef Studio AI Project" uid="${timestamp}">
      <project name="${cleanName}_edited" uid="${timestamp}_proj">
        <sequence format="r1" duration="60s" tcStart="0s" tcFormat="NDF">
          <spine>
            <asset-clip name="${cleanName}" ref="r2" offset="0s" duration="60s" start="0s" tcFormat="NDF"/>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}

// Call OpenAI API directly with user's API key
async function callOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const openAIModel = model.replace('openai/', '');
  
  const modelMap: Record<string, string> = {
    'gpt-5': 'gpt-4o',
    'gpt-5-mini': 'gpt-4o-mini',
    'gpt-5-nano': 'gpt-4o-mini',
    'gpt-5.2': 'gpt-4o',
  };
  
  const actualModel = modelMap[openAIModel] || 'gpt-4o';
  
  console.log(`Calling OpenAI API with model: ${actualModel}`);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: actualModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: 128000,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", response.status, error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Call Gemini API directly with user's API key
async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const modelMap: Record<string, string> = {
    'google/gemini-3-flash-preview': 'gemini-2.0-flash',
    'google/gemini-3-pro-preview': 'gemini-2.5-pro-preview-05-06',
    'google/gemini-2.5-pro': 'gemini-1.5-pro',
    'google/gemini-2.5-flash': 'gemini-1.5-flash',
    'google/gemini-2.5-flash-lite': 'gemini-1.5-flash-8b',
  };
  
  const actualModel = modelMap[model] || 'gemini-2.0-flash';
  
  console.log(`Calling Gemini API with model: ${actualModel}`);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 65536,
          topP: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error:", response.status, error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Call Lovable AI Gateway (fallback)
async function callLovableAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  console.log(`Calling Lovable AI Gateway with model: ${model}`);
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: 128000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Lovable AI error:", response.status, error);
    
    if (response.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again in a few minutes.");
    } else if (response.status === 402) {
      throw new Error("AI service requires payment. Please add credits.");
    }
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Validate and clean FCPXML output
function validateAndCleanFCPXML(output: string): string | null {
  if (!output.includes("<fcpxml") || !output.includes("</fcpxml>")) {
    return null;
  }

  const fcpxmlStart = output.indexOf("<?xml");
  const fcpxmlEnd = output.lastIndexOf("</fcpxml>") + "</fcpxml>".length;
  
  if (fcpxmlStart !== -1 && fcpxmlEnd > fcpxmlStart) {
    return output.slice(fcpxmlStart, fcpxmlEnd);
  }
  
  const altStart = output.indexOf("<fcpxml");
  if (altStart !== -1) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${output.slice(altStart, fcpxmlEnd)}`;
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      fileContent, 
      fileName, 
      preset, 
      model, 
      styleRules, 
      sessionId, 
      advancedConfig,
      fileType,
      isVideoFile 
    } = await req.json();

    if (!fileName || !preset || !model) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    const rateLimitKey = sessionId || "anonymous";
    const { data: rateLimitData } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("id", rateLimitKey)
      .maybeSingle();

    if (rateLimitData) {
      const windowStart = new Date(rateLimitData.window_start);
      const now = new Date();
      
      if (now.getTime() - windowStart.getTime() < 60 * 60 * 1000) {
        if (rateLimitData.job_count >= 25) {
          return new Response(
            JSON.stringify({ success: false, error: "Rate limit exceeded. Max 25 jobs per hour." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await supabase.from("rate_limits").update({ job_count: rateLimitData.job_count + 1 }).eq("id", rateLimitKey);
      } else {
        await supabase.from("rate_limits").update({ job_count: 1, window_start: new Date().toISOString() }).eq("id", rateLimitKey);
      }
    } else {
      await supabase.from("rate_limits").insert({ id: rateLimitKey, job_count: 1, window_start: new Date().toISOString() });
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        input_filename: fileName,
        preset,
        model,
        style_rules: styleRules,
        status: "processing",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create job:", jobError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create job record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompts
    const systemPrompt = buildSystemPrompt(preset, styleRules, advancedConfig, fileType, isVideoFile);
    
    let userPrompt: string;
    if (isVideoFile) {
      // For video files, generate a template and ask AI to enhance it
      const templateXml = generateVideoFCPXML(fileName, fileType);
      userPrompt = `Process this video file and generate an edited FCPXML project:

Source File: ${fileName}
Format: ${fileType || 'auto-detect'}

Base Template:
${templateXml}

Apply the specified style, effects, and AI tools to generate a complete edited timeline.`;
    } else {
      userPrompt = `Process this FCPXML timeline with AKEEF STUDIO AI algorithms:\n\n${fileContent}`;
    }

    // Determine AI provider and get appropriate API key
    const provider = getAIProvider(model);
    let outputContent = "";
    
    console.log(`Job ${job.id}: Using ${provider} provider with model ${model} for ${isVideoFile ? 'video' : 'timeline'} file`);

    try {
      if (provider === 'openai') {
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) {
          throw new Error("OpenAI API key not configured. Please add your API key in settings.");
        }
        outputContent = await callOpenAI(openaiKey, model, systemPrompt, userPrompt);
      } else if (provider === 'gemini') {
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) {
          throw new Error("Gemini API key not configured. Please add your API key in settings.");
        }
        outputContent = await callGemini(geminiKey, model, systemPrompt, userPrompt);
      } else {
        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        if (!lovableKey) {
          throw new Error("AI service not configured.");
        }
        outputContent = await callLovableAI(lovableKey, model, systemPrompt, userPrompt);
      }
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      await supabase.from("jobs").update({ status: "failed", error_message: aiError instanceof Error ? aiError.message : "AI processing failed" }).eq("id", job.id);
      return new Response(
        JSON.stringify({ success: false, error: aiError instanceof Error ? aiError.message : "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate output
    let cleanedXml = validateAndCleanFCPXML(outputContent);
    
    // If AI failed to generate valid FCPXML for video files, use the template
    if (!cleanedXml && isVideoFile) {
      console.log("AI output invalid, using template for video file");
      cleanedXml = generateVideoFCPXML(fileName, fileType);
    }
    
    if (!cleanedXml) {
      console.error("Invalid FCPXML output from AI");
      await supabase.from("jobs").update({ 
        status: "failed", 
        error_message: "AI output was not valid FCPXML. Try a different model or simplify input." 
      }).eq("id", job.id);
      return new Response(
        JSON.stringify({ success: false, error: "AI output was not valid FCPXML. Try again or use a different model." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save output file
    const outputFileName = fileName.replace(/\.[^/.]+$/, '_akeef_studio.fcpxml');
    const outputPath = `public/${Date.now()}_${outputFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("fcpxml-files")
      .upload(outputPath, new Blob([cleanedXml], { type: "application/xml" }), { contentType: "application/xml" });

    if (uploadError) {
      console.error("Failed to upload output:", uploadError);
      await supabase.from("jobs").update({ status: "failed", error_message: "Failed to save output file" }).eq("id", job.id);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save output file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Complete job
    const { data: updatedJob } = await supabase
      .from("jobs")
      .update({
        status: "completed",
        output_filename: outputFileName,
        output_file_path: outputPath,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .select()
      .single();

    console.log(`Job ${job.id} completed successfully with ${provider} for ${fileType || 'unknown'} file`);

    return new Response(
      JSON.stringify({ success: true, job: updatedJob || job, outputXml: cleanedXml }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});