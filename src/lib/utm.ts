/** Remembers the first UTM params we saw this session, so DM links stay tagged through to submit. */
const KEY = "ib_utm";

export function captureUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (k.startsWith("utm_")) out[k] = v.slice(0, 120);
    });
    if (Object.keys(out).length) sessionStorage.setItem(KEY, JSON.stringify(out));
  } catch {
    // Private windows can throw on storage. Fall through with what we have.
  }
  return out;
}
