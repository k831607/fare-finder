import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Plain Vite + React SPA. `vite build` emits a static site to dist/.
// Deep links (e.g. /app) are rewritten to index.html by vercel.json.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true, // resolves the @/* alias from tsconfig.json
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
  },
});
