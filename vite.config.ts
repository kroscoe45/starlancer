import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
  },

  // Development server configuration
  server: {
    port: 5173, // Explicit port (matches your DAP config)
    host: true, // Allow external connections
    strictPort: true, // Fail if port is already in use
  },

  // Enable source maps in development
  css: {
    devSourcemap: true,
  },

  // Optimize dependencies for debugging
  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  // Define for better debugging experience
  define: {
    __DEV__: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Environment variable validation for Cognito configuration
  envPrefix: ["VITE_"],
});
