import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: true,
  //   port: 8080,
  //   allowedHosts: [
  //     '.cloud9.us-east-1.amazonaws.com',
  //     '.amazonaws.com'
  //   ]
  // }
});
