const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e',
    timeout: 45000,
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'mobile', use: { ...devices['Pixel 5'] } },
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ],
});
