import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
  },
  reporter: 'line',
});