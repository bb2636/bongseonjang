import crypto from 'crypto';
import { AppDataSource } from '../../../config/database.js';
import { OAuthSession } from '../../../entity/OAuthSession.js';
import { MoreThan } from 'typeorm';

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

const TTL_MS = 5 * 60 * 1000;

let cleanupCounter = 0;

class OAuthSessionStore {
  private getRepo() {
    return AppDataSource.getRepository(OAuthSession);
  }

  async save(data: OAuthSessionData): Promise<string> {
    const key = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + TTL_MS);

    const repo = this.getRepo();
    const session = repo.create({
      id: key,
      type: 'oauth',
      status: 'active',
      data,
      expiresAt,
    });
    await repo.save(session);

    cleanupCounter++;
    if (cleanupCounter >= 10) {
      cleanupCounter = 0;
      this.cleanup().catch(() => {});
    }

    return key;
  }

  async get(key: string): Promise<OAuthSessionData | null> {
    const repo = this.getRepo();
    const entry = await repo.findOne({
      where: {
        id: key,
        type: 'oauth',
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!entry) {
      return null;
    }

    await repo.delete({ id: key });
    return entry.data as OAuthSessionData;
  }

  async cleanup(): Promise<void> {
    const repo = this.getRepo();
    await repo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}

export const oauthSessionStore = new OAuthSessionStore();

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

const POLLING_TTL_MS = 10 * 60 * 1000;

class PollingSessionStore {
  private getRepo() {
    return AppDataSource.getRepository(OAuthSession);
  }

  async create(sessionId?: string): Promise<string> {
    const id = sessionId || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + POLLING_TTL_MS);

    const repo = this.getRepo();
    const session = repo.create({
      id,
      type: 'polling',
      status: 'pending',
      data: { status: 'pending' },
      expiresAt,
    });
    await repo.save(session);

    return id;
  }

  async update(sessionId: string, data: Partial<PollingSessionData>): Promise<boolean> {
    const repo = this.getRepo();
    const entry = await repo.findOne({
      where: {
        id: sessionId,
        type: 'polling',
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!entry) {
      return false;
    }

    const mergedData = { ...(entry.data as PollingSessionData), ...data };
    entry.data = mergedData;
    entry.status = mergedData.status || entry.status;
    await repo.save(entry);
    return true;
  }

  async check(sessionId: string): Promise<PollingSessionData | null> {
    const repo = this.getRepo();
    const entry = await repo.findOne({
      where: {
        id: sessionId,
        type: 'polling',
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!entry) {
      return null;
    }

    return entry.data as PollingSessionData;
  }

  async consume(sessionId: string): Promise<PollingSessionData | null> {
    const repo = this.getRepo();
    const entry = await repo.findOne({
      where: {
        id: sessionId,
        type: 'polling',
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!entry) {
      return null;
    }

    await repo.delete({ id: sessionId });
    return entry.data as PollingSessionData;
  }
}

export const pollingSessionStore = new PollingSessionStore();
