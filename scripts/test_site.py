#!/usr/bin/env python3
"""Dependency-free structural regressions. These are not browser/Lighthouse tests."""
import json
import re
import struct
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

from build_site import ROOT, OUT, SITE_URL, SOURCE, polish_html


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.stack = []
        self.nesting_errors = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            self.nesting_errors.append((tag, self.stack[-1] if self.stack else None))
        else:
            self.stack.pop()

    def elements(self, name):
        return [attrs for tag, attrs in self.tags if tag == name]


class PortfolioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = SOURCE.read_text(encoding='utf-8')  # prerendered React page (web/dist)
        cls.web = ROOT / 'web'
        cls.css = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((OUT / 'app').glob('*.css')))
        cls.entry = [p for p in (OUT / 'app').glob('index-*.js')]
        cls.html = (OUT / 'index.html').read_text(encoding='utf-8')
        cls.page = Page(cls.html)
        cls.text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', cls.html))
        cls.ids = [attrs['id'] for _, attrs in cls.page.tags if 'id' in attrs]

    def test_restaurant_case_study_assets_and_privacy(self):
        folder = OUT / 'projects/restaurant-analytics'
        html = (folder / 'index.html').read_text(encoding='utf-8')
        page = Page(html)
        self.assertEqual(page.nesting_errors, [])
        self.assertEqual(page.stack, [])
        self.assertIn('Real operational aggregates', html)
        self.assertIn('Power BI Desktop', html)
        for _, attrs in page.tags:
            for attr in ('src', 'href'):
                value = attrs.get(attr, '')
                parsed = urlparse(value)
                if value and not parsed.scheme and not value.startswith('#'):
                    self.assertTrue((folder / unquote(parsed.path)).is_file(), value)
        for name in ('orders.csv', 'menu_items.csv', 'notifications.csv', 'item_pairs.csv'):
            text = (folder / 'dashboard' / name).read_text()
            self.assertIn('DEMO-', text)
            for denied in ('customer_phone', 'customer_address', 'stripe_payment_id', 'delivered_endpoint_digests'):
                self.assertNotIn(denied, text)
        for forbidden in ('production-aggregates.json', 'private-eda.svg'):
            self.assertFalse(list(folder.rglob(forbidden)))

    def test_observed_aggregate_reconciliation_and_project_order(self):
        folder = OUT / 'projects/restaurant-analytics/dashboard'
        data = json.loads((folder / 'observed-aggregates.json').read_text())
        self.assertEqual(data['executive']['total_orders'], 53)
        self.assertEqual(sum(x['orders'] for x in data['payments']), 53)
        self.assertEqual(sum(x['orders'] for x in data['fulfilment']), 53)
        self.assertEqual(sum(x['orders'] for x in data['monthly']), 53)
        self.assertAlmostEqual(sum(x['gross_value'] for x in data['payments']), 1031.74)
        self.assertEqual(sum(x['units'] for x in data['products']), 121)
        bundled = (folder / 'observed-data.js').read_text()
        self.assertEqual(json.loads(bundled.split(' = ', 1)[1].rstrip(';\n')), data)
        for denied in ('customer_name', 'customer_phone', 'customer_address', 'order_id', 'stripe_payment_id'):
            self.assertNotIn(denied, json.dumps(data))
        self.assertLess(self.html.index('id="file-dp"'), self.html.index('id="file-kh4"'))
        self.assertLess(self.html.index('id="file-kh4"'), self.html.index('id="GA-RA-07"'))
        active = (folder / 'index.html').read_text(encoding='utf-8')
        self.assertIn('observed-data.js', active)
        self.assertNotIn('demo-data.js', active)

    def test_metadata_singletons_and_valid_jsonld(self):
        self.assertGreaterEqual(len(self.page.elements('title')), 3)  # page + named quantitative figures
        self.assertEqual(self.html.count('<title>Ghobikan'), 1)
        for key in ('description', 'twitter:card', 'twitter:image'):
            self.assertEqual(sum(m.get('name') == key for m in self.page.elements('meta')), 1)
        canonical = [a for a in self.page.elements('link') if a.get('rel') == 'canonical']
        self.assertEqual(canonical[0]['href'], SITE_URL)
        scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', self.html, re.S)
        person = json.loads(scripts[0])
        self.assertEqual(person['name'], 'Ghobikan Aravindan')
        self.assertEqual(person['address']['addressLocality'], 'London')
        projects = json.loads(scripts[1])['itemListElement']
        self.assertEqual(len(projects), 8)
        for project in projects:
            self.assertIn(project['item']['url'].split('#')[1], self.ids)

    def test_recruiter_routes_and_qualification(self):
        self.assertRegex(self.html, r'class="[^"]*\brecruiter-intro\b')
        self.assertIn('Restaurant operations', self.text)
        self.assertIn('NLP evaluation', self.text)
        intro = self.html.split('recruiter-intro"', 1)[1].split('<nav class="collection-index"', 1)[0]
        for target in ('#GA-RA-07', '#file-kh4', 'mailto:ghobikan15@hotmail.co.uk'):
            self.assertIn(target, intro)

    def test_lab_bench_uses_measured_values(self):
        lab = self.html.split('data-lab=', 1)[1].split('<nav class="collection-index"', 1)[0]
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', lab))
        for value in ('.933', '.909–.957', 'ε 2', 'ε 6', '1,338', '0.65', '0.30', '2.5×', '2.1–3.3', 'Expected counts', 'not a transaction-volume claim'):
            self.assertIn(value, text)
        for tab in ('tab-research', 'tab-applications', 'tab-systems'):
            self.assertIn(tab, self.ids)
        bench = (self.web / 'src/lib/bench.ts').read_text(encoding='utf-8')
        for value in ('0.933', '0.944', '0.945', '0.909', '0.927', '0.928', '0.957', 'high: 0.96,', '0.961', 'REFERENCE_AUC = 0.953'):
            self.assertIn(value, bench)

    def test_nlp_metrics_keep_development_limits(self):
        kh = self.html.split('id="file-kh4"', 1)[1].split('id="GA-RA-07"', 1)[0]
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', kh))
        for value in ('0.65', '0.55–0.77', '0.30', '2.5', '2.1–3.3',
                      '197/200', 'One annotator', 'Not a final test set', 'five-fold'):
            self.assertIn(value, text)

    def test_pbix_provenance_not_promoted(self):
        self.assertNotIn('A real-data PBIX', self.html)
        case = (OUT / 'projects/restaurant-analytics/index.html').read_text()
        self.assertNotIn('real-data, de-identified PBIX', case)
        self.assertIn('embedded data provenance is not independently verified', case)

    def test_power_bi_report_is_click_to_load_and_consistent(self):
        # One report URL: the homepage figure and the case-study page embed the same report.
        lib = (self.web / 'src/lib/powerbi.ts').read_text(encoding='utf-8')
        embed = (OUT / 'projects/restaurant-analytics/powerbi-embed.js').read_text(encoding='utf-8')
        pattern = r'https://app\.powerbi\.com/view\?r=[A-Za-z0-9=_-]+'
        self.assertEqual(re.findall(pattern, lib), re.findall(pattern, embed))
        # The homepage never auto-loads the third-party report: no iframe until a visitor asks.
        self.assertEqual(self.page.elements('iframe'), [])
        ra = self.html.split('id="GA-RA-07"', 1)[1].split('id="file-uag"', 1)[0]
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', ra))
        for value in ('Power BI report', '53', '£1.03K', '£373.77', '22.6%', 'not audited revenue', 'not independently reconciled'):
            self.assertIn(value, text)
        self.assertIn('observed-summary.svg', ra)  # the SQL snapshot stays available without JavaScript

    def test_explicit_markup_is_balanced(self):
        self.assertEqual(self.page.nesting_errors, [])
        self.assertEqual(self.page.stack, [])

    def test_evidence_pass(self):
        for text in ('8.68 s', '8.54 s', '304-row extract', 'not volume-representative', 'RDP accounting', 'MIDI stems'):
            self.assertIn(text, self.text)
        self.assertGreaterEqual(len(self.page.elements('figure')), 7)

    def test_builder_is_idempotent_and_layout_independent(self):
        self.assertEqual(polish_html(self.html), self.html)
        changed = self.source.replace('<section class="hero recruiter-intro"', '<section data-test="changed" class="hero recruiter-intro"')
        self.assertIn('data-test="changed"', polish_html(changed))
        with self.assertRaisesRegex(RuntimeError, 'METADATA'):
            polish_html(self.source.replace('<!-- METADATA:START -->', ''))

    def test_landmarks_and_headings(self):
        self.assertEqual(len(self.page.elements('main')), 1)
        self.assertEqual(len(self.page.elements('h1')), 1)
        previous = 0
        for tag, _ in self.page.tags:
            if re.fullmatch('h[1-6]', tag):
                level = int(tag[1])
                self.assertLessEqual(level, previous + 1, f'Heading jumped from {previous} to {level}')
                previous = level
        self.assertTrue(any(a.get('href') == '#projects' and a.get('class') == 'skip-link' for a in self.page.elements('a')))

    def test_ids_anchors_and_aria_references(self):
        self.assertEqual(len(self.ids), len(set(self.ids)), Counter(self.ids))
        for _, attrs in self.page.tags:
            if attrs.get('href', '').startswith('#'):
                self.assertIn(unquote(attrs['href'][1:]), self.ids)
            for attr in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
                for reference in attrs.get(attr, '').split():
                    self.assertIn(reference, self.ids)
        for case in ('GA-RA-07', 'GA-KH-01', 'GA-DI-02', 'GA-CD-03', 'GA-UA-04', 'GA-DP-05', 'GA-CA-06'):
            self.assertIn(case, self.ids)

    def test_no_js_disclosures_and_semantic_visuals(self):
        self.assertEqual(len(self.page.elements('details')), 7)
        self.assertEqual(len(self.page.elements('summary')), 7)
        self.assertNotIn('onclick=', self.html)
        for svg in self.page.elements('svg'):
            self.assertTrue(svg.get('aria-hidden') == 'true' or svg.get('aria-labelledby'))
        for script in self.page.elements('script'):
            if script.get('src'):  # never parser-blocking: deferred or a module script
                self.assertTrue('defer' in script or script.get('type') == 'module', script)

    def test_assets_work_under_pages_prefix(self):
        for _, attrs in self.page.tags:
            for attr in ('src', 'href'):
                url = attrs.get(attr, '')
                parsed = urlparse(url)
                if not url or parsed.scheme or url.startswith('#'):
                    continue
                self.assertFalse(url.startswith('/'), f'Asset bypasses /Portfolio/: {url}')
                self.assertTrue((OUT / unquote(parsed.path)).is_file(), url)
        cv = OUT / 'assets/Ghobikan-Aravindan-CV.pdf'
        self.assertTrue(cv.read_bytes().startswith(b'%PDF'))
        self.assertEqual(cv.read_bytes(), (ROOT / 'assets' / cv.name).read_bytes())

    def test_generated_social_assets_and_crawlers(self):
        png = (OUT / 'assets/social-preview.png').read_bytes()
        self.assertEqual(struct.unpack('>II', png[16:24]), (1200, 630))
        self.assertIn(SITE_URL + 'assets/social-preview.png', self.html)
        for file in ('assets/favicon.svg', 'assets/apple-touch-icon.png', '.nojekyll', '404.html'):
            self.assertTrue((OUT / file).is_file())
        self.assertIn(SITE_URL, (OUT / 'sitemap.xml').read_text())
        self.assertIn(SITE_URL + 'sitemap.xml', (OUT / 'robots.txt').read_text())
        self.assertIn('url=/Portfolio/', (OUT / '404.html').read_text())

    def test_external_link_security(self):
        for attrs in self.page.elements('a'):
            if attrs.get('href', '').startswith('http'):
                self.assertEqual(attrs.get('target'), '_blank')
                self.assertTrue({'noopener', 'noreferrer'} <= set(attrs.get('rel', '').split()))

    def test_interactive_dossier_uses_authored_evidence(self):
        evidence = (self.web / 'src/lib/evidence.ts').read_text(encoding='utf-8')
        for feature in ('row.cells', 'partition-readout', 'evidenceinspect', 'requestAnimationFrame(updateReadingPosition)', 'ResizeObserver'):
            self.assertIn(feature, evidence)
        self.assertIn('id="partition-benchmark"', self.html)
        # The prerendered menu button stays hidden until React hydrates and can operate it.
        self.assertRegex(self.html, r'<button[^>]*class="menu-button"[^>]*hidden')
        header = (self.web / 'src/components/Header.tsx').read_text(encoding='utf-8')
        self.assertIn('classList.add("nav-enhanced")', header)

    def test_content_guardrails_and_motion_fallback(self):
        self.assertNotIn('Blackhorse', self.html)
        self.assertNotIn('crestbound-duelists.streamlit.app', self.html)
        for text in ('single-runner measurements', 'Implemented / demo-only forecasts', 'synthetic bootstrap', 'not membership-inference'):
            self.assertIn(text, self.text)
        css = self.css
        self.assertRegex(css, r'prefers-reduced-motion:\s*reduce')
        # Content remains visible while the optional scripts load or if they fail.
        # Decorative ::before/::after overlays (no content) may also start transparent.
        # (Minified CSS writes pseudo-elements with a single colon: :before / :after.)
        unscoped = re.sub(r'[^{}]*:{1,2}(?:before|after)\s*\{[^}]*\}', '', css)
        self.assertNotRegex(unscoped, r'(?<!-)opacity:\s*0\s*[;}]')
        self.assertNotIn('motion-intro', self.source)
        choreography = (self.web / 'src/components/Choreography.tsx').read_text(encoding='utf-8')
        self.assertIn('prefers-reduced-motion: no-preference', choreography)
        self.assertIn('gsap.matchMedia', choreography)

    def test_react_app_is_prerendered_and_bundled_locally(self):
        # The page is complete before JavaScript runs: React hydrates prerendered HTML.
        self.assertIn('<div id="root"><a class="skip-link"', self.html)
        self.assertNotIn('<!--app-html-->', self.html)
        sources = [attrs['src'] for attrs in self.page.elements('script') if attrs.get('src')]
        self.assertTrue(sources)
        for src in sources:
            self.assertFalse(urlparse(src).scheme, f'Remote script: {src}')
        for link in self.page.elements('link'):
            if link.get('rel') == 'stylesheet':
                self.assertFalse(urlparse(link['href']).scheme, f'Remote stylesheet: {link["href"]}')
        # Three.js / React Three Fiber are never on the critical path: a lazy chunk only.
        self.assertEqual(len(self.entry), 1)
        entry = self.entry[0].read_text(encoding='utf-8')
        self.assertNotIn('WebGLRenderer', entry)
        lazy = [p for p in (OUT / 'app').glob('*.js') if p not in self.entry]
        self.assertTrue(any('WebGLRenderer' in p.read_text(encoding='utf-8') for p in lazy))
        self.assertIn('import(', entry)  # the canvases are dynamic imports
        # Dependencies are pinned to exact versions.
        package = json.loads((self.web / 'package.json').read_text(encoding='utf-8'))
        for name, version in {**package['dependencies'], **package['devDependencies']}.items():
            self.assertRegex(version, r'^\d+\.\d+\.\d+$', name)
        for library in ('react', 'motion', '@react-three/fiber', 'gsap', 'lenis', 'three'):
            self.assertIn(library, package['dependencies'])
        # React Bits components keep their licence beside them.
        self.assertIn('Commons Clause', (self.web / 'src/reactbits/LICENSE.md').read_text(encoding='utf-8'))
        # The capability check runs before paint so the field's space is reserved (no layout shift).
        head = self.source.split('</head>', 1)[0]
        for guard in ("classList.add('has-field')", 'saveData', "getContext('webgl2')"):
            self.assertIn(guard, head)
        self.assertEqual(self.html.count('<div class="instrument" aria-hidden="true">'), 1)
        self.assertEqual(self.html.count('class="lab-scene signal-field"'), 1)
        # The field only renders while visible, on screen and without reduced motion.
        field = (self.web / 'src/components/SlatField.tsx').read_text(encoding='utf-8')
        for guard in ('IntersectionObserver', 'document.hidden', 'frameloop', '"demand"', '"never"'):
            self.assertIn(guard, field)


if __name__ == '__main__':
    unittest.main(verbosity=2)
