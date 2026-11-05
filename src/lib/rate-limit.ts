/**
 * Small sliding-window limiter. It lives in one serverless instance's memory, so it
 * slows a single abuser rather than being a hard global cap. Paired with the honeypot,
 * the minimum fill time and the DB length constraints, that's enough for a launch form.
 */
const hits = new Map<string, number[]>();

export function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
