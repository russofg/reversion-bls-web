import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.blsnet.com.ar",
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    defaultStrategy: "hover",
  },
  image: {
    quality: 80,
  },
  compressHTML: true,
});
