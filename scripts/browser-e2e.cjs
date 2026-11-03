const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright-core');

(async () => {
  fs.mkdirSync('browser-evidence', { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const errors = [];
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    extraHTTPHeaders: { Authorization: 'Bearer ' + process.env.API_TOKEN }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('file://' + path.resolve('index.html'));
    await page.getByRole('heading', { name: 'Release safely, not just quickly.' }).waitFor();
    await page.getByRole('heading', { name: 'Delivery path' }).waitFor();
    await page.screenshot({ path: 'browser-evidence/architecture-desktop.png', fullPage: true });
    console.log('VISUAL_ARCHITECTURE_JPEG:' +
      (await page.screenshot({ type: 'jpeg', quality: 55 })).toString('base64'));
    console.log('PASS static architecture overview');

    await page.goto('http://127.0.0.1:3000/');
    await page.getByText('Browser Test Hotel', { exact: true }).waitFor();
    await page.getByRole('link', { name: /Browser Test Hotel/ }).click();
    await page.getByText('Guest Media').waitFor();
    await page.getByText('Vegetable Soup').waitFor();
    await page.getByRole('button', { name: /Details/ }).click();
    await page.getByRole('dialog', { name: /Browser Test Hotel/ }).waitFor();
    await page.screenshot({ path: 'browser-evidence/hotel-desktop.png', fullPage: true });
    console.log('VISUAL_HOTEL_JPEG:' +
      (await page.screenshot({ type: 'jpeg', quality: 55 })).toString('base64'));
    console.log('PASS authenticated backend, EJS navigation and modals');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('dialog', { name: /Browser Test Hotel/ }).getByRole('button', { name: 'Close' }).click();
    await page.screenshot({ path: 'browser-evidence/hotel-mobile.png', fullPage: true });
    console.log('VISUAL_MOBILE_JPEG:' +
      (await page.screenshot({ type: 'jpeg', quality: 55 })).toString('base64'));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
    assert.equal(overflow, false, 'hotel UI overflows the mobile viewport');
    console.log('PASS mobile layout (390px)');
    assert.deepEqual(errors, [], 'uncaught browser errors: ' + errors.join('; '));
    fs.writeFileSync('browser-evidence/checks.json', JSON.stringify({
      checks: ['architecture', 'hotel navigation', 'hotel modal', 'mobile overflow'],
      errors
    }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error('BROWSER E2E FAILURE:', error); process.exitCode = 1; });
