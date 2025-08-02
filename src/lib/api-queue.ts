// API request queue manager to handle rate limiting
class ApiRequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly minDelay = 120; // 120ms between requests

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest);
      }

      const requestFn = this.queue.shift();
      if (requestFn) {
        this.lastRequestTime = Date.now();
        await requestFn();
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isQueueProcessing(): boolean {
    return this.isProcessing;
  }
}

// Global request queue instance
export const apiRequestQueue = new ApiRequestQueue();

// Wrapper function for making API requests with automatic queuing
export async function makeQueuedApiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequestQueue.add(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (response.status >= 500) {
        throw new Error('Service temporarily unavailable');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  });
}

// Cache management for API responses
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly ttl = 5 * 60 * 1000; // 5 minutes TTL

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new ApiCache();
