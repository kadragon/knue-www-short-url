import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'], // Look for test files in the 'test' directory
  },
});
