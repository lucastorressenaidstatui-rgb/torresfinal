const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: './tests', timeout: 45000, workers: 1, use: { baseURL: process.env.APP_URL || 'http://localhost:8090', headless: true, channel: 'msedge' } });
