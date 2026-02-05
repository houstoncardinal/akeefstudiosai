import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure VITE_* vars are available in the sandbox/dev transform.
  // (Without this, import.meta.env may miss the backend URL and crash at startup.)
  define: (() => {
    const env = loadEnv(mode, process.cwd(), "VITE_");

    const supabaseUrl =
      env.VITE_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "";

    const supabaseKey =
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "";

    return {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
    };
  })(),
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
