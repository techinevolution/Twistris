import { resolve } from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        game: resolve(__dirname, "index.html"),
        phaserProof: resolve(__dirname, "proofs/phaser.html"),
      },
    },
  },
});
