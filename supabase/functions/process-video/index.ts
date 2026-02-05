import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,           // Local dev
  /^https:\/\/.*\.lovable\.app$/,       // Lovable preview deployments
  /^https:\/\/.*\.supabase\.co$/,       // Supabase hosted
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGIN_PATTERNS.some(p => p.test(origin));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// ============================================
// AKEEF STUDIO AI - UNIVERSAL VIDEO PROCESSING ENGINE
// Supports: MOV, MP4, ProRes, HEVC, RAW, FCPXML, and more
// Powered by OpenAI & Google Gemini
// ============================================

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const AI_TIMEOUT_MS = 50_000; // 50 seconds (Supabase edge functions have a 60s limit)
const MAX_RETRIES = 1;

interface AdvancedConfig {
  colorGrade: string;
  effectPreset: string;
  graphics: string[];
  versions: string[];
  exportFormat: string;
  formatTools: string[];
}

// Determine which API to use based on model and available keys
function getAIProvider(model: string): 'openai' | 'gemini' | 'lovable' {
  if (model.startsWith('openai/')) {
    const key = Deno.env.get("OPENAI_API_KEY");
    return key ? 'openai' : 'lovable';
  }
  if (model.startsWith('google/')) {
    const key = Deno.env.get("GEMINI_API_KEY");
    return key ? 'gemini' : 'lovable';
  }
  return 'lovable';
}

// Sanitize filename to prevent path traversal and XML injection
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>&'"]/g, '') // Remove XML special chars
    .replace(/\.\./g, '')    // Remove path traversal
    .replace(/[/\\]/g, '_')  // Replace path separators
    .replace(/[^\w.\-\s()]/g, '_') // Only allow safe chars
    .trim()
    .slice(0, 255);          // Limit length
}

// Build comprehensive editing system prompt for all video types
function buildSystemPrompt(preset: string, styleRules: string, advancedConfig?: AdvancedConfig, fileType?: string, isVideoFile?: boolean): string {
  const mode = isVideoFile
    ? `MODE: VIDEO FILE (${fileType || 'video'}). Generate an FCPXML project referencing the source video with edit decisions, cuts, color grading, effects, and graphics markers.
AI Tools: ${advancedConfig?.formatTools?.join(', ') || 'Standard processing'}`
    : `MODE: TIMELINE FILE. Modify the existing FCPXML, preserving all media references, asset IDs, audio sync, and compound clip relationships.`;

  const advancedSection = advancedConfig ? `
COLOR GRADE: ${advancedConfig.colorGrade} (embed correction metadata, adjustment layer markers)
EFFECTS MODE: ${advancedConfig.effectPreset} (optimal transition durations, effect placeholders, motion keyframes)
GRAPHICS: ${advancedConfig.graphics.length > 0 ? advancedConfig.graphics.join(', ') : 'None'} (title insertion points, lower-third safe zones, caption timing)
VERSIONS: ${advancedConfig.versions.join(', ')} (chapter markers, aspect ratio metadata)
AI TOOLS: ${advancedConfig.formatTools?.length > 0 ? advancedConfig.formatTools.join(', ') : 'Standard'}` : '';

  return `You are AKEEF STUDIO AI, an elite video editing AI. Output ONLY valid FCPXML. No explanations, no markdown, no code blocks.

${mode}

OUTPUT RULES:
1. Start with: <?xml version="1.0" encoding="UTF-8"?>
2. Use <fcpxml version="1.9"> with complete <resources>, <library>, <event>, <project>, <sequence>, <spine> structure
3. Use frame-accurate timing (e.g., "1001/30000s" for 30fps, "1001/24000s" for 24fps)
4. For video files: create multiple asset-clips from the source with varied offsets, durations, and effects to build a professional edit
5. Include <transition> elements between clips using cross-dissolve, dip-to-black, or style-appropriate transitions
6. Add <adjust-transform> for scale/position keyframes (Ken Burns, zoom pulses, reframes)
7. Use <filter-video> for color corrections, LUTs, and visual effects
8. Add <note> elements with AI editing rationale for each major decision

STYLE: ${preset.split('_').join(' ').toUpperCase()}

${styleRules}
${advancedSection}

EDITING INTELLIGENCE:
- PACING: Apply Golden Ratio timing (1.618x variation between cuts). Build tension with progressively shorter cuts, release with extended hero shots.
- BEAT SYNC: Align cuts to musical downbeats and phrase boundaries. Use flash frames on accents, speed ramps on drops.
- VISUAL FLOW: Maintain 180-degree rule, match action continuity, apply rule-of-thirds reframes.
- ENERGY: Match visual energy to audio dynamics. Use L-cuts/J-cuts for dialogue flow, Kuleshov sequencing for emotion.
- STRUCTURE: Create intro hook (first 2s), rising action, climax, and resolution. Add chapter markers.

Output ONLY the FCPXML document now.`;
}

// Generate advanced multi-clip FCPXML for video files
function generateVideoFCPXML(fileName: string, fileType: string): string {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const ts = Date.now();

  // Build a multi-clip timeline with transitions, effects, and markers
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1001/30000s" width="1920" height="1080"/>
    <format id="r2" name="FFVideoFormat1080p24" frameDuration="1001/24000s" width="1920" height="1080"/>
    <asset id="a1" name="${cleanName}" uid="${ts}" start="0s" duration="300s" hasVideo="1" hasAudio="1" format="r1">
      <media-rep kind="original-media" src="file://./${fileName}"/>
    </asset>
    <effect id="e1" name="Cross Dissolve" uid=".../Transitions.localized/Dissolves.localized/Cross Dissolve.effectBundle"/>
    <effect id="e2" name="Dip to Black" uid=".../Transitions.localized/Dissolves.localized/Fade to Color.effectBundle"/>
  </resources>
  <library location="file://./Akeef_Studio_Library.fcpbundle/">
    <event name="Akeef Studio AI - ${cleanName}" uid="${ts}">
      <project name="${cleanName}_akeef_edit" uid="${ts}_proj">
        <sequence format="r1" duration="60s" tcStart="0s" tcFormat="NDF">
          <spine>
            <note>AKEEF STUDIO AI - Auto-edited rough cut with scene segmentation</note>
            <!-- Opening hook -->
            <asset-clip name="${cleanName} - Intro" ref="a1" offset="0s" duration="8008/30000s" start="0s" tcFormat="NDF">
              <note>Opening hook shot - grab attention</note>
              <adjust-transform position="0 0" anchor="0 0" scale="1.05 1.05"/>
            </asset-clip>
            <transition name="Cross Dissolve" offset="8008/30000s" duration="1001/30000s">
              <filter-video ref="e1"/>
            </transition>
            <!-- Scene 1 - Rising action -->
            <asset-clip name="${cleanName} - Scene 1" ref="a1" offset="9009/30000s" duration="12012/30000s" start="10010/30000s" tcFormat="NDF">
              <note>Scene 1 - Establish story</note>
            </asset-clip>
            <transition name="Cross Dissolve" offset="21021/30000s" duration="1001/30000s">
              <filter-video ref="e1"/>
            </transition>
            <!-- Scene 2 - Development -->
            <asset-clip name="${cleanName} - Scene 2" ref="a1" offset="22022/30000s" duration="10010/30000s" start="25025/30000s" tcFormat="NDF">
              <note>Scene 2 - Build energy</note>
              <adjust-transform position="0 0" anchor="0 0" scale="1.02 1.02"/>
            </asset-clip>
            <transition name="Dip to Black" offset="32032/30000s" duration="1001/30000s">
              <filter-video ref="e2"/>
            </transition>
            <!-- Scene 3 - Climax -->
            <asset-clip name="${cleanName} - Climax" ref="a1" offset="33033/30000s" duration="15015/30000s" start="45045/30000s" tcFormat="NDF">
              <note>Climax - Peak energy moment</note>
            </asset-clip>
            <transition name="Cross Dissolve" offset="48048/30000s" duration="2002/30000s">
              <filter-video ref="e1"/>
            </transition>
            <!-- Scene 4 - Resolution -->
            <asset-clip name="${cleanName} - Outro" ref="a1" offset="50050/30000s" duration="9009/30000s" start="75075/30000s" tcFormat="NDF">
              <note>Resolution - Closing sequence</note>
              <adjust-transform position="0 0" anchor="0 0" scale="1.03 1.03"/>
            </asset-clip>
          </spine>
          <chapter-marker start="0s" duration="8008/30000s" value="Intro"/>
          <chapter-marker start="9009/30000s" duration="12012/30000s" value="Scene 1"/>
          <chapter-marker start="22022/30000s" duration="10010/30000s" value="Scene 2"/>
          <chapter-marker start="33033/30000s" duration="15015/30000s" value="Climax"/>
          <chapter-marker start="50050/30000s" duration="9009/30000s" value="Outro"/>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}

// Fetch with timeout using AbortController
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`AI request timed out after ${Math.round(timeoutMs / 1000)}s. Try a faster model or simpler input.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
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
  const maxTokens = actualModel.includes('mini') ? 16384 : 16384;

  console.log(`Calling OpenAI API with model: ${actualModel}`);

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
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
      max_tokens: maxTokens,
      top_p: 0.9,
    }),
  }, AI_TIMEOUT_MS);

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", response.status, error);
    if (response.status === 429) throw new Error("OpenAI rate limit exceeded. Please try again in a few minutes.");
    if (response.status === 401) throw new Error("Invalid OpenAI API key. Please check your key in settings.");
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Call Gemini API directly with user's API key
async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const modelMap: Record<string, string> = {
    'google/gemini-3-flash-preview': 'gemini-2.0-flash',
    'google/gemini-2.5-pro': 'gemini-2.5-pro-preview-05-06',
    'google/gemini-2.5-flash': 'gemini-2.5-flash-preview-04-17',
    'google/gemini-2.5-flash-lite': 'gemini-2.0-flash-lite',
  };

  const actualModel = modelMap[model] || 'gemini-2.0-flash';

  console.log(`Calling Gemini API with model: ${actualModel}`);

  const response = await fetchWithTimeout(
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
    },
    AI_TIMEOUT_MS
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error:", response.status, error);
    if (response.status === 429) throw new Error("Gemini rate limit exceeded. Please try again in a few minutes.");
    if (response.status === 400) throw new Error("Invalid Gemini API key or request. Please check your key.");
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Call Lovable AI Gateway (fallback)
async function callLovableAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  console.log(`Calling Lovable AI Gateway with model: ${model}`);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const isOpenAIModel = model.startsWith('openai/');

  // The gateway forwards to multiple providers; some OpenAI models expect
  // `max_completion_tokens` instead of `max_tokens`.
  const tokenLimitPayload = model.startsWith('openai/')
    ? { max_completion_tokens: 8192 }
    : { max_tokens: 16384 };

  const payload: Record<string, unknown> = {
    model,
    messages,
    ...tokenLimitPayload,
    // Some OpenAI gateway routes only support default temperature.
    ...(isOpenAIModel ? {} : { temperature: 0.15 }),
  };
  
  const response = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, AI_TIMEOUT_MS);

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
  if (!output || typeof output !== 'string') return null;

  // Strip markdown code blocks the AI might have wrapped around the XML
  let cleaned = output.replace(/```(?:xml|fcpxml)?\s*/gi, '').replace(/```\s*$/gm, '').trim();

  if (!cleaned.includes("<fcpxml") || !cleaned.includes("</fcpxml>")) {
    return null;
  }

  const fcpxmlEnd = cleaned.lastIndexOf("</fcpxml>") + "</fcpxml>".length;

  // Try to extract starting from <?xml
  const xmlDeclStart = cleaned.indexOf("<?xml");
  if (xmlDeclStart !== -1 && fcpxmlEnd > xmlDeclStart) {
    cleaned = cleaned.slice(xmlDeclStart, fcpxmlEnd);
  } else {
    // No XML declaration - start from <fcpxml
    const fcpxmlStart = cleaned.indexOf("<fcpxml");
    if (fcpxmlStart !== -1) {
      cleaned = `<?xml version="1.0" encoding="UTF-8"?>\n${cleaned.slice(fcpxmlStart, fcpxmlEnd)}`;
    } else {
      return null;
    }
  }

  // Validate essential FCPXML structure
  const hasResources = cleaned.includes("<resources") || cleaned.includes("<resources/");
  const hasLibraryOrProject = cleaned.includes("<library") || cleaned.includes("<project");
  if (!hasResources && !hasLibraryOrProject) {
    console.warn("FCPXML missing required structure (resources/library/project)");
    // Still return it - the AI may have a valid but unconventional structure
  }

  return cleaned;
}

// Call AI with retry logic
async function callAIWithRetry(
  provider: 'openai' | 'gemini' | 'lovable',
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${provider}`);
        await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
      }

      switch (provider) {
        case 'openai':
          if (!openaiKey) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in Supabase secrets.");
          return await callOpenAI(openaiKey, model, systemPrompt, userPrompt);
        case 'gemini':
          if (!geminiKey) throw new Error("Gemini API key not configured. Set GEMINI_API_KEY in Supabase secrets.");
          return await callGemini(geminiKey, model, systemPrompt, userPrompt);
        case 'lovable':
          if (!lovableKey) throw new Error("No AI service configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in Supabase secrets.");
          return await callLovableAI(lovableKey, model, systemPrompt, userPrompt);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Don't retry auth errors or rate limits
      if (lastError.message.includes("API key") || lastError.message.includes("401")) {
        throw lastError;
      }
      console.error(`AI call attempt ${attempt} failed:`, lastError.message);
    }
  }

  // If primary provider failed, try fallback to lovable gateway
  if (provider !== 'lovable' && lovableKey) {
    console.log(`Primary provider ${provider} failed, falling back to Lovable gateway`);
    try {
      return await callLovableAI(lovableKey, model, systemPrompt, userPrompt);
    } catch (fallbackErr) {
      console.error("Fallback also failed:", fallbackErr);
    }
  }

  throw lastError || new Error("AI processing failed after retries");
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Check request size
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: "Request too large. Maximum 10MB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      fileContent,
      fileName: rawFileName,
      preset,
      model,
      styleRules,
      sessionId,
      advancedConfig,
      fileType,
      isVideoFile
    } = await req.json();

    if (!rawFileName || !preset || !model) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: fileName, preset, and model are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileName = sanitizeFileName(rawFileName);

    // Rate limiting - use atomic upsert to prevent TOCTOU race
    const rateLimitKey = sessionId || "anonymous";
    const now = new Date();

    const { data: rateLimitData } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("id", rateLimitKey)
      .maybeSingle();

    if (rateLimitData) {
      const windowStart = new Date(rateLimitData.window_start);
      if (now.getTime() - windowStart.getTime() < 60 * 60 * 1000) {
        if (rateLimitData.job_count >= 25) {
          return new Response(
            JSON.stringify({ success: false, error: "Rate limit exceeded. Max 25 jobs per hour." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await supabase
          .from("rate_limits")
          .update({ job_count: rateLimitData.job_count + 1 })
          .eq("id", rateLimitKey)
          .eq("job_count", rateLimitData.job_count); // Optimistic concurrency
      } else {
        await supabase
          .from("rate_limits")
          .update({ job_count: 1, window_start: now.toISOString() })
          .eq("id", rateLimitKey);
      }
    } else {
      await supabase
        .from("rate_limits")
        .upsert({ id: rateLimitKey, job_count: 1, window_start: now.toISOString() });
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

    // Route to the correct AI provider based on model selection
    const provider = getAIProvider(model);
    let outputContent = "";

    console.log(`Job ${job.id}: Using ${provider} with model ${model} for ${isVideoFile ? 'video' : 'timeline'} file`);

    try {
      outputContent = await callAIWithRetry(provider, model, systemPrompt, userPrompt);
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      const errorMsg = aiError instanceof Error ? aiError.message : "AI processing failed";
      await supabase.from("jobs").update({ status: "failed", error_message: errorMsg }).eq("id", job.id);
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate output
    let cleanedXml = validateAndCleanFCPXML(outputContent);

    // Fallbacks if AI output is invalid
    if (!cleanedXml && !isVideoFile && typeof fileContent === 'string') {
      const originalXml = validateAndCleanFCPXML(fileContent);
      if (originalXml) {
        console.log("AI output invalid, falling back to original timeline XML");
        cleanedXml = originalXml;
      }
    }

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
    const outputFileName = sanitizeFileName(fileName.replace(/\.[^/.]+$/, '_akeef_studio.fcpxml'));
    const outputPath = `public/${Date.now()}_${outputFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fcpxml-files")
      .upload(
        outputPath,
        new Blob([cleanedXml], { type: "application/xml" }),
        { contentType: "application/xml", upsert: true }
      );

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
    const corsHeaders = getCorsHeaders(req);
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});