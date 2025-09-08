const KEY = 'igrb_settings_v1';
const DEFAULTS = { enabled: true, mode: 'hide' };

function load() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KEY], (res) => resolve(res[KEY] ? { ...DEFAULTS, ...res[KEY] } : DEFAULTS));
  });
}
function save(s) {
  return new Promise((resolve) => chrome.storage.sync.set({ [KEY]: s }, resolve));
}

document.addEventListener('DOMContentLoaded', async () => {
  const enabledEl = document.getElementById('enabled');
  const modeEl = document.getElementById('mode');

  const s = await load();
  enabledEl.checked = !!s.enabled;
  modeEl.value = s.mode;

  enabledEl.addEventListener('change', async (e) => {
    const cur = await load();
    await save({ ...cur, enabled: e.target.checked });
  });

  modeEl.addEventListener('change', async (e) => {
    const cur = await load();
    await save({ ...cur, mode: e.target.value });
  });
});
