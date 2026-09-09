#!/usr/bin/env python3
"""Read-only external HTTP check; distinguish blocked/unknown from broken.

Run explicitly, not in CI: transient providers should not break a deterministic build.
This verifies HTTP reachability, not that an app's interactive UI is operational.
"""
import concurrent.futures
import urllib.error
import urllib.request
from urllib.parse import urldefrag

from build_site import OUT
from test_site import Page


def check(url):
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Portfolio-Link-Check/1.0'})
        with urllib.request.urlopen(request, timeout=20) as response:
            return url, response.status, response.url
    except urllib.error.HTTPError as error:
        return url, error.code, 'BROKEN' if error.code in (404, 410) else 'UNVERIFIED: provider response'
    except (urllib.error.URLError, TimeoutError) as error:
        return url, 'UNKNOWN', str(error.reason if hasattr(error, 'reason') else error)


if __name__ == '__main__':
    page = Page((OUT / 'index.html').read_text())
    urls = sorted({urldefrag(a['href'])[0] for a in page.elements('a') if a.get('href', '').startswith('https://')})
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for url, status, final in pool.map(check, urls):
            print(f'{status}\t{url}\t{final}')
