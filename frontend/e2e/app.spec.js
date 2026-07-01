const { test, expect } = require('@playwright/test');

test('mobile: draggable bottom sheet over the map', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');

    await page.goto('/');
    // Search bar renders
    await expect(page.locator('.search-bar')).toBeVisible();
    // Map fills the viewport on mobile
    await expect(page.locator('.mobile-map')).toBeVisible();
    // Bottom sheet is present (vaul)
    const sheet = page.locator('.sheet');
    await expect(sheet).toBeVisible();

    // Results load from the backend
    await expect(page.locator('.place-card').first()).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1600); // let the sheet settle at its initial snap
    await page.screenshot({ path: testInfo.outputPath('mobile-peek.png'), fullPage: false });

    // Drag the handle upward to expand the sheet
    const handle = page.locator('[data-vaul-handle]').first();
    const box = await handle.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, 120, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(600);
    }
    await page.screenshot({ path: testInfo.outputPath('mobile-expanded.png'), fullPage: false });
});

test('desktop: split map + list, no bottom sheet', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/');
    await expect(page.locator('.discover .results-pane')).toBeVisible();
    await expect(page.locator('.discover .map-pane')).toBeVisible();
    await expect(page.locator('.sheet')).toHaveCount(0);
    await expect(page.locator('.place-card').first()).toBeVisible({ timeout: 20000 });
    await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: false });
});

test('dark mode + Top Picks render', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/');
    // Toggle dark mode via the navbar theme button (Moon/Sun)
    await page.locator('.np-icon-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: testInfo.outputPath('dark.png'), fullPage: false });

    // Top Picks page
    await page.goto('/best');
    await expect(page.locator('.best-section').first()).toBeVisible({ timeout: 20000 });
    await page.screenshot({ path: testInfo.outputPath('best.png'), fullPage: false });
});

test('SEO near landing page renders with results + meta', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/near/istanbul/burgers');
    await expect(page.locator('h1')).toContainText(/burgers.*Istanbul/i);
    await expect(page).toHaveTitle(/Best burgers in Istanbul/i);
    await expect(page.locator('.place-card').first()).toBeVisible({ timeout: 20000 });
    // internal SEO links to related pages exist
    await expect(page.locator('.near-chip').first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('near.png'), fullPage: false });
});

test('register + login: navbar reflects authenticated user', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/');
    await page.locator('.np-login').click();
    await expect(page.locator('.auth-modal')).toBeVisible();
    await page.locator('.auth-switch').click(); // switch to register

    const email = `pw_${Date.now()}@nearpoint.app`;
    await page.fill('.auth-modal input[type=email]', email);
    await page.fill('.auth-modal input[type=password]', 'secret12345');
    await page.locator('.auth-modal button[type=submit]').click();

    // modal closes and navbar shows the signed-in user + logout
    await expect(page.locator('.np-user')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: testInfo.outputPath('auth.png'), fullPage: false });
});

test('place detail drawer loads rich details + reviews', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/');
    await page.locator('.place-card').first().click();
    await expect(page.locator('.detail-drawer')).toBeVisible();
    await expect(page.locator('.review').first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: testInfo.outputPath('detail.png'), fullPage: false });
});

test('PWA: installable manifest + active service worker', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#E8552B');

    const swActive = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.ready;
        return !!(reg && reg.active);
    });
    expect(swActive).toBeTruthy();

    const manifest = await (await page.request.get('/manifest.json')).json();
    expect(manifest.name).toContain('NearPoint');
    expect((await page.request.get('/icon-192.png')).status()).toBe(200);
    expect((await page.request.get('/sw.js')).status()).toBe(200);
});

test('tours page: numbered walking route with a start button', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');

    await page.goto('/tours');
    await expect(page.locator('.tour-stop').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.tour-num').first()).toHaveText('1');
    await expect(page.locator('.tour-start')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('tours.png'), fullPage: false });
});
