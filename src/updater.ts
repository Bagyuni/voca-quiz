// 홈 화면 추가한 PWA 모드에서도 새 배포를 자동으로 받기 위함.
// 현재 로드된 index.js의 ?v= 해시와 서버의 최신 index.html에 박힌 해시를 비교.

const CURRENT_VERSION = (() => {
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="index.js"]',
  );
  if (!script) return null;
  try {
    return new URL(script.src).searchParams.get('v');
  } catch {
    return null;
  }
})();

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(window.location.pathname, { cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/index\.js\?v=([a-f0-9]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function checkForUpdate() {
  if (!CURRENT_VERSION) return;
  const latest = await fetchLatestVersion();
  if (latest && latest !== CURRENT_VERSION) {
    window.location.reload();
  }
}

export function startUpdateChecks() {
  checkForUpdate();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
}
