import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base: the built site works from any mount point (domain root,
  // preview URLs, or file:// during local QA).
  base: './',
});
