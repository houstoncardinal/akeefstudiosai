 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Initialize Supabase client with service role for public access
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Parse request body
     const { fileContent, fileName, preset, model, styleRules, sessionId } = await req.json();
 
     if (!fileContent || !fileName || !preset || !model) {
       return new Response(
         JSON.stringify({ success: false, error: "Missing required fields" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Use sessionId for anonymous rate limiting (browser fingerprint)
     const rateLimitKey = sessionId || "anonymous";
     
     // Rate limiting check (10 jobs per hour per session)
     const { data: rateLimitData } = await supabase
       .from("rate_limits")
       .select("*")
       .eq("id", rateLimitKey)
       .maybeSingle();
 
     if (rateLimitData) {
       const windowStart = new Date(rateLimitData.window_start);
       const now = new Date();
       
       if (now.getTime() - windowStart.getTime() < 60 * 60 * 1000) {
         if (rateLimitData.job_count >= 10) {
           return new Response(
             JSON.stringify({ success: false, error: "Rate limit exceeded. Max 10 jobs per hour. Please wait." }),
             { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
         }
         await supabase
           .from("rate_limits")
           .update({ job_count: rateLimitData.job_count + 1 })
           .eq("id", rateLimitKey);
       } else {
         await supabase
           .from("rate_limits")
           .update({ job_count: 1, window_start: new Date().toISOString() })
           .eq("id", rateLimitKey);
       }
     } else {
       await supabase
         .from("rate_limits")
         .insert({ id: rateLimitKey, job_count: 1, window_start: new Date().toISOString() });
     }
 
     // Upload input file to storage
     const inputPath = `public/${Date.now()}_${fileName}`;
     const { error: inputUploadError } = await supabase.storage
       .from("fcpxml-files")
       .upload(inputPath, new Blob([fileContent], { type: "application/xml" }), {
         contentType: "application/xml",
       });
 
     if (inputUploadError) {
       console.error("Failed to upload input:", inputUploadError);
     }
 
     // Create job record
     const { data: job, error: jobError } = await supabase
       .from("jobs")
       .insert({
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
     const systemPrompt = `You are an elite video editor AI with expertise in Final Cut Pro X timeline editing, comparable to professionals at major film studios.
 
 CRITICAL OUTPUT RULES:
 1. Output ONLY valid FCPXML - absolutely no explanations, markdown, or code blocks
 2. Your response MUST start with <?xml version="1.0" encoding="UTF-8"?> and contain a complete <fcpxml> document
 3. Preserve ALL media references, asset IDs, and resource information EXACTLY as provided
 4. Only modify: clip ordering, in/out points, durations, and timeline arrangement
 5. Maintain frame-accurate timing (use the same time format as input)
 6. Keep the XML structure valid and parseable by Final Cut Pro
 7. Preserve all audio/video synchronization
 
 EDIT STYLE: ${preset.split('_').join(' ').toUpperCase()}
 
 PROFESSIONAL EDITING RULES TO APPLY:
 ${styleRules}
 
 Analyze the source FCPXML, apply professional editing techniques based on the style rules, and output ONLY the modified FCPXML document.`;
 
     const userPrompt = `Process this FCPXML and create a professional rough cut:\n\n${fileContent}`;
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
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
         model,
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
         temperature: 0.2,
         max_tokens: 128000,
       }),
     });
 
     if (!aiResponse.ok) {
       const errorText = await aiResponse.text();
       console.error("AI Gateway error:", aiResponse.status, errorText);
       
       let errorMessage = "AI processing failed";
       if (aiResponse.status === 429) {
         errorMessage = "AI rate limit exceeded. Please try again in a few minutes.";
       } else if (aiResponse.status === 402) {
         errorMessage = "AI service temporarily unavailable.";
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
 
     // Validate FCPXML output
     if (!outputXml.includes("<fcpxml") || !outputXml.includes("</fcpxml>")) {
       console.error("Invalid FCPXML output from AI");
       
       await supabase
         .from("jobs")
         .update({ 
           status: "failed", 
           error_message: "AI output was not valid FCPXML. Please try a different model or simplify the input." 
         })
         .eq("id", job.id);
 
       return new Response(
         JSON.stringify({ success: false, error: "AI output was not valid FCPXML. Try again or use a different model." }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Extract clean FCPXML
     const fcpxmlStart = outputXml.indexOf("<?xml");
     const fcpxmlEnd = outputXml.lastIndexOf("</fcpxml>") + "</fcpxml>".length;
     if (fcpxmlStart !== -1 && fcpxmlEnd > fcpxmlStart) {
       outputXml = outputXml.slice(fcpxmlStart, fcpxmlEnd);
     }
 
     // Save output file
     const outputFileName = fileName.replace(".fcpxml", "_ai_roughcut.fcpxml");
     const outputPath = `public/${Date.now()}_${outputFileName}`;
 
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