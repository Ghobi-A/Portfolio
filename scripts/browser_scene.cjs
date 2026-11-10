/* Editorial opening regression: native scroll, reversal and accessibility. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("fs");
const out = process.env.REVIEW_DIR || "/tmp/portfolio-scene-review";
fs.mkdirSync(out, { recursive: true });
const url = process.env.SITE_URL || "http://localhost:8000/";
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  let report = [];
  for (const width of [390, 768, 1440]) {
    const p = await b.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await p.addInitScript(() => {
      window.shifts = [];
      new PerformanceObserver((l) =>
        l.getEntries().forEach((e) => {
          if (!e.hadRecentInput) shifts.push(e.value);
        }),
      ).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(url);
    await p.waitForTimeout(3200);
    await p.screenshot({ path: `${out}/opening-${width}-top.png` });
    const initialCLS = await p.evaluate(() =>
      shifts.reduce((a, b) => a + b, 0),
    );
    const bounds = await p.evaluate(() => {
      let t = ScrollTrigger.getById("editorial-opening");
      return { start: t.start, end: t.end, pin: !!t.pin };
    });
    assert.equal(bounds.pin, true);
    let samples = [];
    for (const fraction of [0, 0.5, 1, 0.5, 0]) {
      await p.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        Math.max(0, bounds.start + (bounds.end - bounds.start) * fraction),
      );
      await p.waitForTimeout(1000);
      samples.push(
        await p.evaluate(() => ({
          p: portfolioMotion.sceneState.progress,
          scatter: portfolioMotion.field?.uniforms.uScatter.value,
          headlineX: gsap.getProperty(".scene-line-one", "xPercent"),
          takeover: getComputedStyle(document.querySelector(".scene-takeover")).clipPath,
        })),
      );
      if (samples.length <= 3)
        await p.screenshot({ path: `${out}/opening-${width}-${fraction}.png` });
    }
    console.log(width, JSON.stringify(samples));
    assert(Math.abs(samples[1].p - samples[3].p) < 0.02);
    assert(Math.abs(samples[0].p - samples[4].p) < 0.02);
    assert(samples[2].p > 0.98);
    assert(samples[2].headlineX < -100);
    assert.equal(samples[2].takeover, "inset(0%)");
    assert(samples[0].scatter > samples[2].scatter);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForTimeout(400);
    assert.equal(
      await p.evaluate(() => !!ScrollTrigger.getById("editorial-opening")),
      false,
    );
    assert(
      ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(
        await p.evaluate(
          () =>
            getComputedStyle(document.querySelector(".recruiter-summary"))
              .transform,
        ),
      ),
    );
    const f = await p.evaluate(() => portfolioMotion.field.frames);
    await p.waitForTimeout(400);
    assert.equal(await p.evaluate(() => portfolioMotion.field.frames), f);
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.waitForTimeout(300);
    assert(
      await p.evaluate(() => !!ScrollTrigger.getById("editorial-opening")),
    );
    await p.locator(".intro-actions a").first().focus();
    assert.equal(
      await p.evaluate(
        () => !!ScrollTrigger.getById("editorial-opening"),
      ),
      false,
    );
    await p.keyboard.press("Enter");
    await p.waitForTimeout(900);
    assert.equal(new URL(p.url()).hash, "#projects");
    assert(await p.locator("#dp-title").isVisible());
    for (const hash of ["#file-dp", "#GA-DP-05", "#contact"]) {
      await p.goto(url + hash);
      await p.waitForTimeout(2500);
      const rect = await p
        .locator(hash)
        .evaluate((e) => ({
          top: e.getBoundingClientRect().top,
          bottom: e.getBoundingClientRect().bottom,
        }));
      assert(
        rect.top < 1000 && rect.bottom > 90,
        `${hash} missed: ${JSON.stringify(rect)}`,
      );
    }
    report.push({
      width,
      bounds,
      samples,
      errors,
      initialLayoutShiftSum: initialCLS,
    });
    assert.deepEqual(errors, []);
    await p.close();
  }
  for (const opts of [
    { javaScriptEnabled: false },
    { reducedMotion: "reduce" },
  ]) {
    const p = await b.newPage({
      ...opts,
      viewport: { width: 390, height: 844 },
    });
    await p.goto(url);
    assert(await p.locator("#identity").isVisible());
    assert(await p.locator(".intro-actions a").first().isVisible());
    await p.screenshot({
      path: `${out}/${opts.javaScriptEnabled === false ? "no-js" : "reduced"}-390.png`,
    });
    await p.close();
  }
  fs.writeFileSync(
    out + "/scene-results.json",
    JSON.stringify(report, null, 2),
  );
  await b.close();
  console.log(JSON.stringify(report, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
