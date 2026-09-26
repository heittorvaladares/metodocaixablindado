import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://metodocaixablindado.com.br",
  adapter: vercel(),
});
