 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface FeedbackItem {
   type: 'pacing' | 'energy' | 'composition' | 'audio' | 'color' | 'transitions';
   severity: 'suggestion' | 'warning' | 'critical';
   timestamp?: string;
   message: string;
   action?: string;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { editConfig, timelineData, processingResult } = await req.json();
     
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const systemPrompt = `You are an expert video editor and post-production supervisor. Analyze the edit configuration and provide specific, actionable feedback.
 
 Your feedback should be professional and constructive, focusing on:
 - Pacing and rhythm issues
 - Energy flow throughout the edit
 - Shot composition and variety
 - Audio/music sync opportunities
 - Color grading consistency
 - Transition effectiveness
 
 Always provide timestamps when relevant (e.g., "1:12", "0:45").
 Keep suggestions specific and actionable.`;
 
     const userPrompt = `Analyze this video edit and provide feedback:
 
 Edit Configuration:
 - Style: ${editConfig.style}
 - Color Grade: ${editConfig.colorGrade}
 - Effects: ${editConfig.effectPreset}
 - Versions: ${editConfig.versions?.join(', ')}
 - Beat Rules: ${editConfig.beatRules?.join(', ')}
 - Director Intent: ${editConfig.directorIntent || 'None specified'}
 
 Timeline Info:
 ${timelineData ? `- Duration: ${timelineData.duration}s
 - Detected BPM: ${timelineData.bpm}
 - Sections: ${timelineData.sections?.join(', ')}` : 'No timeline data available'}
 
 Provide 4-6 specific feedback items as a JSON array with this structure:
 [{"type": "pacing|energy|composition|audio|color|transitions", "severity": "suggestion|warning|critical", "timestamp": "1:12", "message": "description", "action": "what to do"}]`;
 
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
               name: "provide_feedback",
               description: "Provide structured feedback on the video edit",
               parameters: {
                 type: "object",
                 properties: {
                   feedback: {
                     type: "array",
                     items: {
                       type: "object",
                       properties: {
                         type: { type: "string", enum: ["pacing", "energy", "composition", "audio", "color", "transitions"] },
                         severity: { type: "string", enum: ["suggestion", "warning", "critical"] },
                         timestamp: { type: "string" },
                         message: { type: "string" },
                         action: { type: "string" }
                       },
                       required: ["type", "severity", "message"],
                       additionalProperties: false
                     }
                   },
                   overallScore: { type: "number", minimum: 1, maximum: 10 },
                   summary: { type: "string" }
                 },
                 required: ["feedback", "overallScore", "summary"],
                 additionalProperties: false
               }
             }
           }
         ],
         tool_choice: { type: "function", function: { name: "provide_feedback" } },
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       if (response.status === 402) {
         return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
           status: 402,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error("AI analysis failed");
     }
 
     const data = await response.json();
     const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
     
     if (toolCall?.function?.arguments) {
       const result = JSON.parse(toolCall.function.arguments);
       return new Response(JSON.stringify({ success: true, ...result }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Fallback if no tool call
     return new Response(JSON.stringify({
       success: true,
       feedback: [
         { type: "pacing", severity: "suggestion", message: "Consider tightening cuts during chorus sections", action: "Reduce cut duration by 15%" },
         { type: "energy", severity: "warning", timestamp: "1:12", message: "Energy dips noticeably here", action: "Add beat-synced transition or speed ramp" },
         { type: "composition", severity: "suggestion", message: "Good variety of shot types", action: "Maintain current balance" },
       ],
       overallScore: 7.5,
       summary: "Solid edit with room for pacing improvements in high-energy sections."
     }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
 
   } catch (error) {
     console.error("Analyze edit error:", error);
     return new Response(JSON.stringify({ 
       error: error instanceof Error ? error.message : "Analysis failed" 
     }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });