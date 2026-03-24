import { defineConfig } from 'vite';

function getBasePath() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
    return repository ? `/${repository}/` : '/';
  }

  return '/';
}

export default defineConfig({
  base: getBasePath(),
});
