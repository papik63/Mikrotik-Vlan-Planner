import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    // Security headers for dev server and vite preview.
    // CSP is also in index.html <meta> tag for static build coverage.
    headers: {
      "X-Content-Type-Options":  "nosniff",
      "X-Frame-Options":         "DENY",
      "Referrer-Policy":         "strict-origin-when-cross-origin",
      "Permissions-Policy":      "camera=(), microphone=(), geolocation=()",
    },
  },

  preview: {
    port: 5173,
    headers: {
      "X-Content-Type-Options":  "nosniff",
      "X-Frame-Options":         "DENY",
      "Referrer-Policy":         "strict-origin-when-cross-origin",
      "Permissions-Policy":      "camera=(), microphone=(), geolocation=()",
    },
  },
});
