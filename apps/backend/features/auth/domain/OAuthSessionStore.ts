import crypto from 'crypto';

export interface OAuthSessionData {
  token?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  requiresEmail?: boolean;
  provider?: string;
  providerId?: string;
  name?: string;
  profileImage?: string;
  tempToken?: string;
  error?: string;
  state?: string;
  user?: {
    id: string | number;
    email: string;
    name: string;
  };
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

// Polling session store for deep-link-free OAuth flow
export interface PollingSessionData {
  status: 'pending' | 'completed' | 'error';
  token?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  error?: string;
  requiresEmail?: boolean;
  provider?: string;
  providerId?: string;
  name?: string;
  user?: {
    id: string | number;
    email: string;
    name: string;
  };
}

interface PollingSessionEntry {
  data: PollingSessionData;
  expiresAt: number;
}

const POLLING_TTL_MS = 10 * 60 * 1000; // 10 minutes

class PollingSessionStore {
  private store: Map<string, PollingSessionEntry> = new Map();

  create(): string {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + POLLING_TTL_MS;
    
    this.store.set(sessionId, { 
      data: { status: 'pending' }, 
      expiresAt 
    });
    this.cleanup();
    
    return sessionId;
  }

  update(sessionId: string, data: Partial<PollingSessionData>): boolean {
    const entry = this.store.get(sessionId);
    if (!entry || Date.now() > entry.expiresAt) {
      return false;
    }
    
    entry.data = { ...entry.data, ...data };
    return true;
  }

  check(sessionId: string): PollingSessionData | null {
    const entry = this.store.get(sessionId);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(sessionId);
      return null;
    }

    return entry.data;
  }

  consume(sessionId: string): PollingSessionData | null {
    const entry = this.store.get(sessionId);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(sessionId);
      return null;
    }

    this.store.delete(sessionId);
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

export const pollingSessionStore = new PollingSessionStore();
