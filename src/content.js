// Blocks/hides Instagram Reels across feed, explore, and direct URLs.

(() => {
  const SETTINGS_KEY = 'igrb_settings_v1';
  const DEFAULTS = { enabled: true, mode: 'hide' }; // 'hide' | 'remove'
  let settings = { ...DEFAULTS };
  let observer = null;

  const hide = (el) => {
    if (!el) return;
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('height', '0px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
  };
  const remove = (el) => el?.parentElement?.removeChild(el);
  const nuke = (el) => (settings.mode === 'remove' ? remove(el) : hide(el));

  const isReelsUrl = (href) => /\/reels?\//.test(href);

  function blockReels(root = document) {
    // 1) Any card/link that routes to /reel/ or /reels/
    root.querySelectorAll('a[href^="/reel/"], a[href^="/reels/"]').forEach((a) => {
      const card = a.closest('article, div[role="link"], div[role="button"], li, div');
      nuke(card || a);
    });

    // 2) Nav or labels explicitly mentioning "Reels"
    root.querySelectorAll('[aria-label], h1, h2, h3, h4, h5, h6, span, div').forEach((el) => {
      const label = (el.getAttribute?.('aria-label') || el.textContent || '').trim().toLowerCase();
      if (label === 'reels' || label.startsWith('reels')) {
        const section = el.closest('section, nav, div, article') || el;
        nuke(section);
      }
    });

    // 3) If user is on a reels page directly, blank body
    try {
      const url = new URL(location.href);
      if (isReelsUrl(url.pathname)) nuke(document.body);
    } catch {}
  }

  function start() {
    if (observer) return;
    observer = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => n.nodeType === 1 && blockReels(n));
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  function apply() {
    if (settings.enabled) {
      blockReels();
      start();
    } else {
      stop();
    }
  }

  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(['igrb_settings_v1'], (res) => {
          settings = { ...DEFAULTS, ...(res?.[SETTINGS_KEY] || {}) };
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes[SETTINGS_KEY]) return;
    settings = { ...settings, ...changes[SETTINGS_KEY].newValue };
    apply();
  });

  loadSettings().then(apply);
})();
