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

from build_site import ROOT, OUT, SITE_URL, polish_html


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def elements(self, name):
        return [attrs for tag, attrs in self.tags if tag == name]


class PortfolioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (ROOT / 'index.html').read_text()
        cls.html = (OUT / 'index.html').read_text()
        cls.page = Page(cls.html)
        cls.text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', cls.html))
        cls.ids = [attrs['id'] for _, attrs in cls.page.tags if 'id' in attrs]

    def test_metadata_singletons_and_valid_jsonld(self):
        self.assertEqual(len(self.page.elements('title')), 3)  # page + two SVG titles
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
        self.assertEqual(len(projects), 6)
        for project in projects:
            self.assertIn(project['item']['url'].split('#')[1], self.ids)

    def test_builder_is_idempotent_and_layout_independent(self):
        self.assertEqual(polish_html(self.html), self.html)
        changed = self.source.replace('<section class="hero wrap"', '<section data-test="changed" class="hero wrap"')
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
        for case in ('GA-KH-01', 'GA-DI-02', 'GA-CD-03', 'GA-UA-04', 'GA-DP-05', 'GA-CA-06'):
            self.assertIn(case, self.ids)

    def test_no_js_disclosures_and_semantic_visuals(self):
        self.assertEqual(len(self.page.elements('details')), 6)
        self.assertEqual(len(self.page.elements('summary')), 6)
        self.assertNotIn('onclick=', self.html)
        for svg in self.page.elements('svg'):
            self.assertTrue(svg.get('aria-hidden') == 'true' or svg.get('aria-labelledby'))
        for script in self.page.elements('script'):
            if script.get('src'):
                self.assertIn('defer', script)

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

    def test_content_guardrails_and_motion_fallback(self):
        self.assertNotIn('Blackhorse', self.html)
        self.assertNotIn('crestbound-duelists.streamlit.app', self.html)
        for text in ('single-runner measurements', 'Open PR / not released', 'synthetic bootstrap', 'not membership-inference'):
            self.assertIn(text, self.text)
        css = (OUT / 'assets/css/site.css').read_text()
        self.assertRegex(css, r'prefers-reduced-motion:\s*reduce')
        self.assertNotRegex(css, r'(?<!-)opacity:\s*0\s*[;}]')
        motion = (OUT / 'assets/js/motion.js').read_text()
        self.assertIn('!window.gsap', motion)
        self.assertIn('prefers-reduced-motion: no-preference', motion)


if __name__ == '__main__':
    unittest.main(verbosity=2)
