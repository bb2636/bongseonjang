interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_MAX_SIZE = 100;

export class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private readonly maxSize: number;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictExpiredOrOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  private evictExpiredOrOldest(): void {
    const now = Date.now();

    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        return;
      }
    }

    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
