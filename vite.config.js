import { defineConfig } from 'vite';

function getBasePath() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    return './';
  }

  return '/';
}

export default defineConfig({
  base: getBasePath(),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          network: ['yjs', 'y-webrtc'],
        },
      },
    },
  },
});
