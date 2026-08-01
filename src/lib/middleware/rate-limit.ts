type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitWindow>();

export function createRateLimiter(options: { limit: number; windowMs: number }) {
  return function rateLimit(key: string): boolean {
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }

    current.count += 1;
    return current.count <= options.limit;
  };
}
