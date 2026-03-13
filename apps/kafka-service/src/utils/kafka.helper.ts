const cache = new Map<string, number>();
const TTL = 3000;

export function isDuplicate(event: any) {
  const key = `${event.userId}-${event.type}-${event.productId}`;
  const now = Date.now();

  if (cache.has(key)) {
    const last = cache.get(key)!;
    if (now - last < TTL) return true;
  }

  cache.set(key, now);
  return false;
}
