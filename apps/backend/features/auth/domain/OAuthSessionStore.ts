import crypto from 'crypto';

export interface OAuthSessionData {
  token?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  requiresEmail?: boolean;
  provider?: string;
  providerId?: string;
  name?: string;
  tempToken?: string;
  error?: string;
  state?: string;
}

interface SessionEntry {
  data: OAuthSessionData;
  expiresAt: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes

class OAuthSessionStore {
  private store: Map<string, SessionEntry> = new Map();

  save(data: OAuthSessionData): string {
    const key = crypto.randomUUID();
    const expiresAt = Date.now() + TTL_MS;
    
    this.store.set(key, { data, expiresAt });
    this.cleanup();
    
    return key;
  }

  get(key: string): OAuthSessionData | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    this.store.delete(key);
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const oauthSessionStore = new OAuthSessionStore();
