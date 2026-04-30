#!/usr/bin/env python3
"""
parse-disqus.py

Parses the Disqus XML export (gzipped or plain) and outputs a JSON
file consumed by migrate-disqus-comments.ts.

Usage:
  python3 scripts/parse-disqus.py /path/to/export.xml.gz > disqus-comments.json

Slug remaps: Disqus slug → DB slug
"""

import sys
import json
import gzip
import xml.etree.ElementTree as ET
from collections import defaultdict

# ── Config ────────────────────────────────────────────────────────────────────

SLUG_REMAPS = {
    'tomorrows-muse-2':    'tomorrows-muse',
    'untethered-prologue': 'untethered-memoirs-of-a-retired-nerd',
}

NS_D   = 'http://disqus.com'
NS_DSQ = 'http://disqus.com/disqus-internals'

def ns(tag):   return f'{{{NS_D}}}{tag}'
def dsq(tag):  return f'{{{NS_DSQ}}}{tag}'

# ── Load XML ──────────────────────────────────────────────────────────────────

path = sys.argv[1] if len(sys.argv) > 1 else 'disqus-export.xml.gz'

with (gzip.open(path, 'rb') if path.endswith('.gz') else open(path, 'rb')) as f:
    xml_bytes = f.read()

root = ET.fromstring(xml_bytes.decode('utf-8'))

# ── Parse threads ─────────────────────────────────────────────────────────────

thread_map = {}
for t in root.findall(ns('thread')):
    tid   = t.get(dsq('id'))
    link  = (t.findtext(ns('link')) or '').rstrip('/')
    slug  = link.split('/')[-1] if link else ''
    slug  = SLUG_REMAPS.get(slug, slug)
    title = t.findtext(ns('title')) or ''
    thread_map[tid] = {'slug': slug, 'title': title, 'comments': []}

# ── Parse comments ────────────────────────────────────────────────────────────

for p in root.findall(ns('post')):
    if (p.findtext(ns('isDeleted')) or '') == 'true': continue
    if (p.findtext(ns('isSpam'))    or '') == 'true': continue

    pid      = p.get(dsq('id'))
    thread_el = p.find(ns('thread'))
    tid      = thread_el.get(dsq('id')) if thread_el is not None else None
    if not tid or tid not in thread_map: continue

    parent_el = p.find(ns('parent'))
    parent_id = parent_el.get(dsq('id')) if parent_el is not None else None

    author    = p.find(ns('author'))
    name      = (author.findtext(ns('name'))  or 'Anonymous') if author is not None else 'Anonymous'
    email     = (author.findtext(ns('email')) or '')          if author is not None else ''

    body      = p.findtext(ns('message')) or ''
    created   = p.findtext(ns('createdAt')) or ''

    thread_map[tid]['comments'].append({
        'disqusId':  pid,
        'parentId':  parent_id,
        'name':      name,
        'email':     email,
        'body':      body,
        'createdAt': created,
    })

# ── Output only threads with comments ─────────────────────────────────────────

threads_with_comments = [
    t for t in thread_map.values() if t['comments'] and t['slug']
]

total = sum(len(t['comments']) for t in threads_with_comments)
print(f'# {len(threads_with_comments)} threads, {total} comments', file=sys.stderr)

print(json.dumps({'threads': threads_with_comments}, ensure_ascii=False, indent=2))
