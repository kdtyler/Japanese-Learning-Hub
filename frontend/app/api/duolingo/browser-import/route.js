import { NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

export const runtime = 'nodejs';

const BACKEND_API_BASE =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080';

const WORDS_PAGE_URL = 'https://www.duolingo.com/practice-hub/words';

const isJapaneseStr = (s) =>
  /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(s);

function extractWordsDeep(obj, result, depth) {
  if (!obj || depth > 8) return;
  if (Array.isArray(obj)) {
    for (const item of obj) extractWordsDeep(item, result, depth + 1);
    return;
  }
  if (typeof obj !== 'object') return;
  const word = obj.word ?? obj.text ?? obj.infinitive ?? obj.lemma ?? obj.string;
  if (typeof word === 'string' && isJapaneseStr(word)) {
    const w = word.trim();
    if (w && w.length <= 40 && !result.has(w)) {
      const meaning =
        obj.meaning ?? obj.translation ?? obj.hint ??
        (Array.isArray(obj.translations) ? obj.translations[0] : undefined) ??
        (Array.isArray(obj.hints) ? obj.hints[0] : undefined) ?? '';
      result.set(w, { word: w, meaning: typeof meaning === 'string' ? meaning.trim() : '' });
    }
  }
  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') extractWordsDeep(val, result, depth + 1);
  }
}

// Snapshot currently-rendered words into accumulator map
async function snapshotDomWords(page, acc) {
  const found = await page.evaluate(() => {
    const isJP = (t) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(t);

    // Collect all leaf text nodes within an element, skipping script/style
    const leafTexts = (el) => {
      const out = [];
      const walk = (n) => {
        if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) out.push(t); }
        else if (n.nodeType === 1) {
          const tag = (n.tagName || '').toUpperCase();
          if (tag !== 'SCRIPT' && tag !== 'STYLE') {
            for (const c of n.childNodes) walk(c);
          }
        }
      };
      walk(el);
      return out;
    };

    // Good English meaning: not Japanese, not pure digits, reasonable length
    const isGoodMeaning = (t) => {
      const s = t.trim();
      return s.length >= 2 && s.length <= 120 && !isJP(s) && !/^\d+$/.test(s);
    };

    // True if an element is inside a nav/chrome element (skip these)
    const isInChrome = (el) => {
      let cur = el;
      while (cur && cur !== document.body) {
        const tag = (cur.tagName || '').toLowerCase();
        if (['nav', 'header', 'footer', 'aside', 'script', 'style'].includes(tag)) return true;
        if (cur.getAttribute && cur.getAttribute('role') === 'navigation') return true;
        if (cur.getAttribute && cur.getAttribute('aria-hidden') === 'true') return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const result = [];
    const seenWords = new Set();

    // Use a TreeWalker to find every JP text node in the page regardless of
    // class names. Then walk UP to find a sibling subtree with English text.
    // This is class-name-agnostic and works with any CSS module hash.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent.trim();
      if (!t || !isJP(t) || t.length > 40 || seenWords.has(t)) continue;

      const el = node.parentElement;
      if (!el || isInChrome(el)) continue;

      const word = t;
      let meaning = '';

      // Walk UP from the JP element, checking siblings at each level for EN text.
      // The screenshot shows JP and EN are siblings within the same card container.
      let container = el;
      for (let depth = 0; depth < 8 && container && container !== document.body; depth++) {
        const parent = container.parentElement;
        if (!parent) break;

        for (const sibling of parent.children) {
          if (sibling === container) continue;
          const sibMeanings = leafTexts(sibling).filter(isGoodMeaning);
          if (sibMeanings.length > 0) {
            // Join all meaning parts (e.g. ["speaks", "speak", "tells"] → "speaks, speak, tells")
            meaning = sibMeanings.join(', ');
            break;
          }
        }

        if (meaning) break;
        container = parent;
      }

      seenWords.add(word);
      result.push({ word, meaning });
    }

    return result;
  });

  for (const w of found) {
    const word = (w.word || '').trim();
    if (!word || !isJapaneseStr(word) || word.length > 40) continue;
    if (!acc.has(word) || (w.meaning && !acc.get(word).meaning)) {
      acc.set(word, { word, meaning: w.meaning || '' });
    }
  }
}

// Scroll body + every inner scrollable container by delta pixels
async function scrollAllContainers(page, delta) {
  await page.evaluate((d) => {
    window.scrollBy(0, d);
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      if (el === document.body || el === document.documentElement) continue;
      try {
        const style = window.getComputedStyle(el);
        if (!['auto', 'scroll'].includes(style.overflowY)) continue;
        if (el.scrollHeight - el.clientHeight < 200) continue;
        el.scrollBy(0, d);
      } catch {}
    }
  }, delta);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const userId = body?.userId;
  if (!userId) return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });

  let context;
  let keepOpen = false;
  const domWords = new Map(); // declared here so catch block can import partial results
  const apiWords = new Map();
  try {
    const { chromium } = await import('playwright');
    const userDataDir = path.join(os.homedir(), '.japanese-learning-hub', 'browser-session', 'duolingo');

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: { width: 1400, height: 900 },
    });

    const page = context.pages()[0] || (await context.newPage());

    // Capture any Duolingo JSON response containing Japanese text
    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('duolingo.com')) return;
      try {
        const ct = response.headers()['content-type'] ?? '';
        if (!ct.includes('json')) return;
        const text = await response.text();
        if (!isJapaneseStr(text)) return;
        const data = JSON.parse(text);
        extractWordsDeep(data, apiWords, 0);
      } catch { /* ignore */ }
    });

    await page.goto(WORDS_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await Promise.race([
      page.waitForSelector('tr, li, [class*="word" i], input[type="email"]', { timeout: 10000 }),
      page.waitForTimeout(5000),
    ]).catch(() => {});
    await page.waitForTimeout(2000);

    const urlNow = page.url();
    const html = await page.content().catch(() => '');
    if (urlNow.includes('/log-in') || urlNow.includes('/register') || html.toLowerCase().includes('log in to duolingo')) {
      keepOpen = true;
      return NextResponse.json(
        { error: 'Log in to Duolingo in the opened Chromium window, then click Import Words from Browser again.' },
        { status: 400 }
      );
    }
    if (!urlNow.includes('/words') && !urlNow.includes('/practice-hub')) {
      keepOpen = true;
      return NextResponse.json(
        { error: `Unexpected page (${urlNow}). Log in if needed, close the window, then try again.` },
        { status: 400 }
      );
    }

    await snapshotDomWords(page, domWords);

    let prevCount = domWords.size;
    let stableRounds = 0;
    const MAX_STABLE = 8;
    const MAX_ROUNDS = 400;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      // Scroll body + all inner scrollable containers (300px steps to avoid
      // skipping items in virtual/windowed lists)
      await scrollAllContainers(page, 300);
      await page.waitForTimeout(900);

      // Snapshot new words rendered at this scroll position
      await snapshotDomWords(page, domWords);

      // Try Load More / Show More button.
      // KEY FIX: scrollIntoViewIfNeeded() runs FIRST so off-screen buttons are found.
      let clicked = false;
      try {
        // Playwright-native click handles React's synthetic event system
        const btn = page.locator(
          'button:has-text("Load more"), button:has-text("Load More"), ' +
          'button:has-text("Show more"), button:has-text("More words"), ' +
          '[role="button"]:has-text("Load more"), [role="button"]:has-text("Load More")'
        ).first();
        if (await btn.count() > 0) {
          await btn.scrollIntoViewIfNeeded().catch(() => {}); // scroll BEFORE checking visible
          await page.waitForTimeout(300);
          const visible = await btn.isVisible({ timeout: 500 }).catch(() => false);
          if (visible) {
            await btn.click();
            await page.waitForTimeout(2000);
            await snapshotDomWords(page, domWords);
            clicked = true;
          }
        }
      } catch { /* no button */ }

      // Evaluate fallback: catches any button/div/link with loading-related text
      if (!clicked) {
        clicked = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll(
            'button, a[role="button"], div[role="button"], [data-test*="load"], [data-test*="more"]'
          ));
          for (const el of els) {
            const txt = (el.textContent || '').toLowerCase().trim();
            if ((txt.includes('load') && txt.includes('more')) ||
                txt.includes('show more') || txt === 'more' || txt.includes('more words')) {
              el.scrollIntoView({ behavior: 'instant', block: 'center' });
              el.click();
              return true;
            }
          }
          return false;
        }).catch(() => false);
        if (clicked) {
          await page.waitForTimeout(2000);
          await snapshotDomWords(page, domWords);
        }
      }

      if (domWords.size > prevCount || clicked) {
        prevCount = domWords.size;
        stableRounds = 0;
      } else {
        stableRounds++;
        if (stableRounds >= MAX_STABLE) break;
      }
    }

    // No final-pass snapshot: words are accumulated continuously during
    // the scroll loop above, so re-scanning the full DOM (with all batches
    // loaded) would just be slow redundant work.
    let words = Array.from(domWords.values());

    // Merge API-captured words (may have meanings DOM extraction missed)
    if (apiWords.size > 0) {
      const merged = new Map(words.map(w => [w.word, w]));
      for (const [word, item] of apiWords) {
        if (merged.has(word)) {
          if (!merged.get(word).meaning && item.meaning) merged.get(word).meaning = item.meaning;
        } else {
          merged.set(word, item);
        }
      }
      words = Array.from(merged.values());
    }

    if (words.length === 0) {
      keepOpen = true;
      return NextResponse.json(
        { error: `No Japanese words found (page: ${page.url()}). Browser window is still open — check it is showing words.` },
        { status: 400 }
      );
    }

    const importResponse = await fetch(`${BACKEND_API_BASE}/api/duolingo/import-vocabulary/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    });
    const importPayload = await importResponse.json().catch(() => ({}));
    if (!importResponse.ok) {
      return NextResponse.json(
        { error: importPayload?.error || 'Vocabulary import failed on backend.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      captured: words.length,
      imported: importPayload.imported ?? 0,
      received: importPayload.received ?? words.length,
      apiCaptured: apiWords.size,
    });
  } catch (error) {
    const message = error?.message || 'Unknown error';

    if (message.includes('already in use') || message.includes('Opening in existing browser session')) {
      return NextResponse.json(
        { error: 'The importer browser is already open. Close that Chromium window and try again.' },
        { status: 409 }
      );
    }

    // If the user closed the browser mid-import but we already collected words,
    // go ahead and save them rather than discarding all the work.
    const pageClosedErr = message.includes('has been closed') || message.includes('was closed') ||
      message.includes('Target closed') || message.includes('browser has been closed');
    if (pageClosedErr && domWords.size > 0) {
      try {
        let words = Array.from(domWords.values());
        if (apiWords.size > 0) {
          const merged = new Map(words.map(w => [w.word, w]));
          for (const [word, item] of apiWords) {
            if (!merged.has(word)) merged.set(word, item);
            else if (!merged.get(word).meaning && item.meaning) merged.get(word).meaning = item.meaning;
          }
          words = Array.from(merged.values());
        }
        const importRes = await fetch(`${BACKEND_API_BASE}/api/duolingo/import-vocabulary/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words }),
        });
        const importPayload = await importRes.json().catch(() => ({}));
        return NextResponse.json({
          captured: words.length,
          imported: importPayload.imported ?? 0,
          received: importPayload.received ?? words.length,
          apiCaptured: apiWords.size,
          note: 'Browser was closed early — imported words collected before close.',
        });
      } catch { /* fall through to generic error */ }
    }

    return NextResponse.json({ error: `Browser import failed: ${message}` }, { status: 500 });
  } finally {
    if (context && !keepOpen) await context.close().catch(() => {});
  }
}