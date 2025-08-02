interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class ServerCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes (reduced from 5 minutes)

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache size (number of entries)
  getCacheSize(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  // Get cache keys
  getCacheKeys(): string[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  // Check if a key exists and is not expired
  hasValidKey(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache entry info for debugging
  getCacheInfo(key: string): { exists: boolean; expired: boolean; age: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    const isExpired = age > entry.ttl;
    
    return {
      exists: true,
      expired: isExpired,
      age: age,
    };
  }

  // Clean expired entries
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Generate cache key for portfolio data
  generatePortfolioKey(address: string, chainIds: string[]): string {
    return `portfolio:${address}:${chainIds.sort().join(',')}`;
  }
}

export const serverCache = new ServerCache();
