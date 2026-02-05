import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Supabase configuration - these are PUBLIC keys (anon key is meant to be public)
const SUPABASE_URL = "https://bunfknfhytdolxluwjoh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bmZrbmZoeXRkb2x4bHV3am9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDkxNDYsImV4cCI6MjA4NTgyNTE0Nn0.s0H5g1sjN4pQJAU_WFaAHrxQ6zG9YdejnuE30KmjoV4";
const SUPABASE_PROJECT_ID = "bunfknfhytdolxluwjoh";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(SUPABASE_ANON_KEY),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(SUPABASE_PROJECT_ID),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
