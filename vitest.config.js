import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    globals: true,
    setupFiles: ['src/lib/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      exclude: [
        'src/lib/__tests__/**',
        'src/lib/**/*.test.js',
        'src/lib/ports/**',
      ],
      reporter: ['text', 'lcov'],
    },
  },
});
