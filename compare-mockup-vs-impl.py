#!/usr/bin/env python3
"""
Compare FULL-SITE-LIGHT-v2 and FULL-SITE-DARK-v2 mockup components
against actual implementation files and globals.css dark mode tokens.

Run from the project root:
  python3 compare-mockup-vs-impl.py
"""

import os
import re
from html.parser import HTMLParser

BASE = os.path.expanduser('~/ai-workspace/projects/nsisongeffiong')

# ── Extract component classes from a mockup file ──────────────────────────────

class MockupExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pages = {}
        self.current_page = None
        self.in_label = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get('class', '').strip()

        if 'plbl' in cls or 'page-label' in cls:
            self.in_label = True
            return

        if cls == 'page':
            key = f'page_{len(self.pages)+1}'
            self.current_page = key
            self.pages[key] = {'label': '', 'classes': []}
            return

        if self.current_page and cls:
            for token in cls.split():
                if token not in ('active', 'next', 'or', 'bl'):
                    self.pages[self.current_page]['classes'].append(token)

    def handle_endtag(self, tag):
        self.in_label = False

    def handle_data(self, data):
        text = data.strip()
        if self.in_label and text and self.current_page:
            if not self.pages[self.current_page]['label']:
                self.pages[self.current_page]['label'] = text

def extract_mockup(path):
    ext = MockupExtractor()
    with open(path) as f:
        ext.feed(f.read())
    return ext.pages

# ── File map ──────────────────────────────────────────────────────────────────

label_to_file = {
    'Landing page':                            'app/(public)/page.tsx',
    'Poetry — section':                        'app/(public)/poetry/page.tsx',
    'Tech — section':                          'app/(public)/tech/page.tsx',
    'Ideas & Policy — section':                'app/(public)/ideas/page.tsx',
    'Poetry — single post + comments':         'app/(public)/poetry/[slug]/page.tsx',
    'Tech — single post + comments':           'app/(public)/tech/[slug]/page.tsx',
    'Ideas & Policy — single post + comments': 'app/(public)/ideas/[slug]/page.tsx',
}

admin_files = {
    'Admin login':     'app/admin/login/page.tsx',
    'Admin dashboard': 'app/admin/dashboard/page.tsx',
    'Admin posts':     'app/admin/posts/page.tsx',
    'Admin comments':  'app/admin/comments/page.tsx',
    'Admin post new':  'app/admin/posts/new/page.tsx',
}

admin_components = {
    'Admin login':     ['AdminNav', 'handleSubmit', 'email', 'password', 'loading', 'error', 'teal-hero', 'teal-light'],
    'Admin dashboard': ['AdminNav', 'stats', 'totalPosts', 'published', 'drafts', 'pendingComments', 'poetry', 'tech', 'ideas', 'teal-hero', 'teal-light', 'amber', 'purple'],
    'Admin posts':     ['AdminNav', 'posts', 'slug', 'published', 'Edit', 'teal-hero', 'teal-light'],
    'Admin comments':  ['AdminNav', 'comments', 'pending', 'approved', 'Approve', 'Reject', 'amber'],
    'Admin post new':  ['AdminNav', 'PostEditor'],
}

# ── Light mode palette tokens (must exist in globals.css light section) ───────
light_tokens = [
    '--bg', '--bg2', '--bg3', '--txt', '--txt2', '--txt3',
    '--bdr', '--bdr2',
    '--purple', '--purple-bg', '--purple-txt', '--purple-acc',
    '--teal-hero', '--teal-mid', '--teal-light', '--teal-pale', '--teal-txt', '--teal-comm',
    '--amber', '--amber-bg', '--amber-txt', '--amber-pq', '--amber-pq-txt',
]

# ── Dark mode palette tokens (must exist in globals.css .dark section) ────────
dark_tokens = [
    '--bg', '--bg2', '--bg3', '--txt', '--txt2', '--txt3',
    '--bdr', '--bdr2',
    '--purple', '--purple-bg', '--purple-txt', '--purple-acc',
    '--teal-hero', '--teal-mid', '--teal-light', '--teal-pale', '--teal-txt',
    '--amber', '--amber-bg', '--amber-txt', '--amber-pq', '--amber-pq-txt',
]

# ── Key dark colour values (from FULL-SITE-DARK-v2 palette) ──────────────────
dark_values = {
    '--bg':          '#0E0E0C',
    '--bg2':         '#181815',
    '--txt':         '#F0EFE8',
    '--txt2':        '#A8A89E',
    '--teal-hero':   '#021F1A',
    '--teal-mid':    '#5DCAA5',
    '--teal-light':  '#9FE1CB',
    '--purple':      '#AFA9EC',
    '--purple-acc':  '#7F77DD',
    '--amber':       '#EF9F27',
    '--amber-pq':    '#2C1D06',
}

# ── Run checks ────────────────────────────────────────────────────────────────

light_mockup_path = os.path.join(BASE, 'design-reference', 'FULL-SITE-LIGHT-v2.html')
dark_mockup_path  = os.path.join(BASE, 'design-reference', 'FULL-SITE-DARK-v2.html')

for path, label in [(light_mockup_path, 'light'), (dark_mockup_path, 'dark')]:
    if not os.path.exists(path):
        print(f"ERROR: {label} mockup not found at {path}")
        exit(1)

light_pages = extract_mockup(light_mockup_path)
dark_pages  = extract_mockup(dark_mockup_path)

total_missing = []

# ── 1. Public pages — structure ───────────────────────────────────────────────
print("=" * 65)
print("1. PUBLIC PAGES — COMPONENT STRUCTURE (vs light mockup)")
print("=" * 65)

for page_data in light_pages.values():
    label = page_data['label']
    if not label:
        continue
    rel_path = label_to_file.get(label)
    if not rel_path:
        continue

    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        print(f"\n✗ {label}: FILE NOT FOUND")
        continue

    with open(filepath) as f:
        content = f.read()

    classes = list(dict.fromkeys(page_data['classes']))
    missing = [c for c in classes if c not in content]
    present = [c for c in classes if c in content]
    pct = len(present) / len(classes) * 100 if classes else 100
    status = '✓' if not missing else '✗'

    print(f"\n{status} {label}: {len(present)}/{len(classes)} ({pct:.0f}%)")
    if missing:
        print(f"  MISSING:")
        for m in missing:
            print(f"    · {m}")
        total_missing.extend([(label, m) for m in missing])

# ── 2. Dark mode — structure matches light ────────────────────────────────────
print("\n" + "=" * 65)
print("2. DARK MOCKUP — STRUCTURE vs LIGHT MOCKUP")
print("=" * 65)

light_all = []
dark_all  = []
for p in light_pages.values():
    light_all.extend(p['classes'])
for p in dark_pages.values():
    dark_all.extend(p['classes'])

light_set = set(light_all)
dark_set  = set(dark_all)

in_light_not_dark = light_set - dark_set
in_dark_not_light = dark_set - light_set

if not in_light_not_dark and not in_dark_not_light:
    print("\n✓ Dark mockup structure matches light mockup exactly")
else:
    if in_light_not_dark:
        print(f"\n✗ In light but missing from dark ({len(in_light_not_dark)}):")
        for c in sorted(in_light_not_dark):
            print(f"  · {c}")
    if in_dark_not_light:
        print(f"\n  In dark but not in light ({len(in_dark_not_light)}):")
        for c in sorted(in_dark_not_light):
            print(f"  · {c}")

# ── 3. globals.css — light + dark token audit ─────────────────────────────────
print("\n" + "=" * 65)
print("3. globals.css — COLOUR TOKEN AUDIT")
print("=" * 65)

globals_path = os.path.join(BASE, 'app', 'globals.css')
if not os.path.exists(globals_path):
    print("ERROR: globals.css not found")
else:
    with open(globals_path) as f:
        css = f.read()

    # Find .dark block
    dark_match = re.search(r'\.dark\s*\{([^}]+)\}', css, re.DOTALL)
    dark_css = dark_match.group(1) if dark_match else ''

    print("\n  Light mode tokens:")
    light_missing = []
    for tok in light_tokens:
        if tok + ':' in css:
            print(f"    ✓ {tok}")
        else:
            print(f"    ✗ {tok}  ← MISSING")
            light_missing.append(tok)

    print("\n  Dark mode tokens (in .dark block):")
    dark_missing = []
    for tok in dark_tokens:
        if tok + ':' in dark_css:
            # Check value
            expected_val = dark_values.get(tok)
            if expected_val:
                if expected_val.lower() in dark_css.lower():
                    print(f"    ✓ {tok}: {expected_val}")
                else:
                    # Extract actual value
                    val_match = re.search(rf'{re.escape(tok)}\s*:\s*([^;]+);', dark_css)
                    actual = val_match.group(1).strip() if val_match else '?'
                    print(f"    ⚠ {tok}: {actual}  (expected {expected_val})")
            else:
                print(f"    ✓ {tok}")
        else:
            print(f"    ✗ {tok}  ← MISSING FROM .dark")
            dark_missing.append(tok)

# ── 4. Admin pages ────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("4. ADMIN PAGES — COMPONENT CHECK")
print("=" * 65)

for label, filepath_rel in admin_files.items():
    filepath = os.path.join(BASE, filepath_rel)
    if not os.path.exists(filepath):
        print(f"\n✗ {label}: FILE NOT FOUND")
        continue
    with open(filepath) as f:
        content = f.read()
    expected = admin_components.get(label, [])
    missing  = [c for c in expected if c not in content]
    present  = [c for c in expected if c in content]
    pct = len(present) / len(expected) * 100 if expected else 100
    status = '✓' if not missing else '✗'
    print(f"\n{status} {label}: {len(present)}/{len(expected)} ({pct:.0f}%)")
    if missing:
        print(f"  MISSING: {', '.join(missing)}")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
if total_missing:
    print(f"\n✗ Public page gaps: {len(total_missing)} missing components")
    seen = []
    for page, cls in total_missing:
        if page not in seen:
            seen.append(page)
            print(f"  · {page}")
else:
    print("\n✓ All public page components match the light mockup")
print("=" * 65)
