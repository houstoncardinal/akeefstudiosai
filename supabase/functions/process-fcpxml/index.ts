 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Get auth header
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ success: false, error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Initialize Supabase client
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     // Get user
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
       return new Response(
         JSON.stringify({ success: false, error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Parse request body
     const { fileContent, fileName, inputPath, preset, model, styleRules } = await req.json();
 
     if (!fileContent || !fileName || !preset || !model) {
       return new Response(
         JSON.stringify({ success: false, error: "Missing required fields" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Rate limiting check (10 jobs per hour)
     const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
     
     // Get or create rate limit record
     const { data: rateLimitData } = await supabase
       .from("rate_limits")
       .select("*")
       .eq("user_id", user.id)
       .single();
 
     if (rateLimitData) {
       const windowStart = new Date(rateLimitData.window_start);
       const now = new Date();
       
       if (now.getTime() - windowStart.getTime() < 60 * 60 * 1000) {
         // Within the same hour window
         if (rateLimitData.job_count >= 10) {
           return new Response(
             JSON.stringify({ success: false, error: "Rate limit exceeded. Max 10 jobs per hour." }),
             { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
         }
         // Increment count
         await supabase
           .from("rate_limits")
           .update({ job_count: rateLimitData.job_count + 1 })
           .eq("user_id", user.id);
       } else {
         // Reset window
         await supabase
           .from("rate_limits")
           .update({ job_count: 1, window_start: new Date().toISOString() })
           .eq("user_id", user.id);
       }
     } else {
       // Create new rate limit record
       await supabase
         .from("rate_limits")
         .insert({ user_id: user.id, job_count: 1, window_start: new Date().toISOString() });
     }
 
     // Create job record
     const { data: job, error: jobError } = await supabase
       .from("jobs")
       .insert({
         user_id: user.id,
         input_filename: fileName,
         input_file_path: inputPath,
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
 
     // Build the prompt for AI
     const systemPrompt = `You are an expert video editor AI specializing in Final Cut Pro X timeline editing. Your task is to analyze FCPXML timelines and create edited versions based on specific style rules.
 
 CRITICAL RULES:
 1. Output ONLY valid FCPXML - no explanations, no markdown, no code blocks
 2. Your response must start with <?xml and contain a complete <fcpxml> document
 3. Preserve all media references and asset information exactly
 4. Only modify clip ordering, timing, and selection within the timeline
 5. Maintain proper frame accuracy in all timing adjustments
 6. Keep the document structure valid and parseable
 
 EDIT STYLE: ${preset.split('_').join(' ').toUpperCase()}
 
 STYLE RULES TO APPLY:
 ${styleRules}
 
 Analyze the input FCPXML, apply the editing rules to create a rough cut, and return ONLY the modified FCPXML.`;
 
     const userPrompt = `Here is the FCPXML to edit:\n\n${fileContent}`;
 
     // Call Lovable AI Gateway
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       // Update job as failed
       await supabase
         .from("jobs")
         .update({ status: "failed", error_message: "AI service not configured" })
         .eq("id", job.id);
 
       return new Response(
         JSON.stringify({ success: false, error: "AI service not configured" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`Processing job ${job.id} with model ${model}`);
 
     const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: model,
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
         temperature: 0.3,
         max_tokens: 100000,
       }),
     });
 
     if (!aiResponse.ok) {
       const errorText = await aiResponse.text();
       console.error("AI Gateway error:", aiResponse.status, errorText);
       
       let errorMessage = "AI processing failed";
       if (aiResponse.status === 429) {
         errorMessage = "Rate limit exceeded. Please try again later.";
       } else if (aiResponse.status === 402) {
         errorMessage = "AI usage limit reached. Please add credits.";
       }
 
       await supabase
         .from("jobs")
         .update({ status: "failed", error_message: errorMessage })
         .eq("id", job.id);
 
       return new Response(
         JSON.stringify({ success: false, error: errorMessage }),
         { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const aiData = await aiResponse.json();
     let outputXml = aiData.choices?.[0]?.message?.content || "";
 
     // Validate the output is FCPXML
     if (!outputXml.includes("<fcpxml") || !outputXml.includes("</fcpxml>")) {
       console.error("Invalid FCPXML output from AI");
       
       await supabase
         .from("jobs")
         .update({ 
           status: "failed", 
           error_message: "AI output was not valid FCPXML. Please try again." 
         })
         .eq("id", job.id);
 
       return new Response(
         JSON.stringify({ success: false, error: "AI output was not valid FCPXML" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Extract just the FCPXML portion if there's extra text
     const fcpxmlStart = outputXml.indexOf("<?xml");
     const fcpxmlEnd = outputXml.lastIndexOf("</fcpxml>") + "</fcpxml>".length;
     if (fcpxmlStart !== -1 && fcpxmlEnd > fcpxmlStart) {
       outputXml = outputXml.slice(fcpxmlStart, fcpxmlEnd);
     }
 
     // Save output file to storage
     const outputFileName = fileName.replace(".fcpxml", "_ai_roughcut.fcpxml");
     const outputPath = `${user.id}/${Date.now()}_${outputFileName}`;
 
     const { error: uploadError } = await supabase.storage
       .from("fcpxml-files")
       .upload(outputPath, new Blob([outputXml], { type: "application/xml" }), {
         contentType: "application/xml",
       });
 
     if (uploadError) {
       console.error("Failed to upload output:", uploadError);
       await supabase
         .from("jobs")
         .update({ status: "failed", error_message: "Failed to save output file" })
         .eq("id", job.id);
 
       return new Response(
         JSON.stringify({ success: false, error: "Failed to save output file" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Update job as completed
     const { data: updatedJob, error: updateError } = await supabase
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
 
     if (updateError) {
       console.error("Failed to update job:", updateError);
     }
 
     console.log(`Job ${job.id} completed successfully`);
 
     return new Response(
       JSON.stringify({
         success: true,
         job: updatedJob || job,
         outputXml,
       }),
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