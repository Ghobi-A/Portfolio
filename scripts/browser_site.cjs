/* Run against a generated site: SITE_URL=http://127.0.0.1:8000 node scripts/browser_site.cjs
 * Requires Playwright in the review environment, not in the shipped website.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const url = process.env.SITE_URL || 'http://127.0.0.1:8000';
const output = process.env.REVIEW_DIR || '/tmp/portfolio-browser-review';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const report = [];
  try {
    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.addInitScript(() => {
        window.motionLog = [];
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (frames, options) {
          window.motionLog.push({ target: this.id || this.className?.baseVal || this.className, delay: options.delay || 0, frames });
          return animate.call(this, frames, options);
        };
      });
      await page.goto(url);
      await page.waitForTimeout(1200);
      assert(await page.locator('#identity').isVisible());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: opening overflow`);
      const sequence = await page.evaluate(() => window.motionLog.filter(item => ['recruiter-role', 'headline-line', 'recruiter-summary', 'recruiter-description', 'actions intro-actions'].includes(item.target)));
      assert.equal(sequence.length, 5);
      assert.deepEqual(sequence.map(item => item.delay), [0,85,170,255,340]);
      await page.screenshot({ path: path.join(output, `after-${width}.png`) });
      // Keyboard-only mobile menu and focus return.
      if (width <= 760) {
        await page.locator('.menu-button').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Work');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'), 'false');
        assert(await page.locator('.menu-button').evaluate(el => el === document.activeElement));
      }
      // SVG point focus survives selecting an observation; exact values never count up.
      const point = page.locator('[data-point="1"]');
      await point.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-privacy-auc]').textContent(), '0.944');
      assert.equal(await page.locator('[data-privacy-select]').nth(1).getAttribute('aria-pressed'), 'true');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-privacy-auc]').textContent(), '0.945');
      await page.locator('[data-privacy-full-scale]').check();
      assert.match(await page.locator('[data-privacy-axis-note]').textContent(), /Full AUC/);
      await page.locator('[data-privacy-full-scale]').uncheck();
      // Every disclosure, chart and diagram must work at every viewport.
      for (const details of await page.locator('.case-study').all()) {
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(280);
        assert(await details.evaluate(el => el.open));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: expanded overflow`);
      }
      for (const inspector of await page.locator('.evidence-inspector').all()) {
        const buttons = inspector.locator('button');
        await buttons.first().focus();
        await page.keyboard.press('End');
        assert.equal(await buttons.last().getAttribute('aria-pressed'), 'true');
        assert((await inspector.locator('[role="status"]').textContent()).length > 15);
      }
      // Observe an offscreen title entering once, then return: no replay.
      await page.locator('#di-title').scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const count = await page.evaluate(() => window.motionLog.filter(item => item.target === 'di-title').length);
      assert.equal(count, 1);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.locator('#di-title').scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => window.motionLog.filter(item => item.target === 'di-title').length), count);
      // Finish image decoding and check fonts and local assets after full traversal.
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
      assert(await page.evaluate(() => document.fonts.check('18px "Source Serif 4"')));
      assert.deepEqual(errors, [], `${width}: browser errors`);
      console.log(`PASS ${width}px: keyboard, charts, diagrams, disclosures, one-shot motion, fonts, images, overflow and console`);
      report.push({ width, status: 'passed', errors, oneShotReveals: count });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
    await page.locator('#di-title').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    await page.locator('#GA-DI-02 summary').click();
    assert(await page.locator('#GA-DI-02').evaluate(el => el.open));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(url + '/#GA-CD-03');
    assert(await page.locator('#GA-CD-03').evaluate(el => el.open));
    await page.goto(url + '/#GA-DP-05');
    await page.goBack();
    assert(await page.locator('#GA-CD-03').evaluate(el => el.open));
    await page.close();
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(url);
    assert.equal(await reduced.evaluate(() => document.getAnimations().length), 0);
    await reduced.close();
    for (const width of [320, 1440]) {
      const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 1000 } });
      await nojs.goto(url);
      assert(await nojs.locator('#identity').isVisible());
      assert(await nojs.locator('#primary-nav').isVisible());
      assert(await nojs.locator('.frontier-values').isVisible());
      await nojs.locator('#GA-DP-05 summary').click();
      assert(await nojs.locator('#GA-DP-05').evaluate(el => el.open));
      assert.equal(await nojs.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await nojs.screenshot({ path: path.join(output, `no-js-${width}.png`) });
      await nojs.close();
    }
    // Direct bookmarks to all existing case studies, without new hash interception.
    const deep = await browser.newPage();
    await deep.goto(url);
    const ids = await deep.locator('.case-study').evaluateAll(elements => elements.map(el => el.id));
    for (const id of ids) {
      await deep.goto(`${url}/#${id}`);
      assert(await deep.locator(`#${id}`).evaluate(el => el.open));
      await deep.waitForTimeout(60);
      const top = await deep.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().top);
      assert(top >= 80 && top < 140, `${id}: anchor obstructed (${top})`);
    }
    await deep.close();
    report.push({ reducedMotionLiveChange: 'passed', noJavaScript: 'passed', keyboard: 'passed', deepLinks: ids });
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
