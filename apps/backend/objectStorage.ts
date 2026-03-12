import { Client } from "@replit/object-storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";
import {
  optimizeBannerImage,
  optimizeThumbnailImage,
  optimizeProductDetailImage,
  isImageFile,
} from "./common/utils/imageOptimizer";

const DEFAULT_BUCKET_NAME = "app-storage";
const CACHE_MAX_AGE_SECONDS = 86400;
const MEMORY_CACHE_MAX_ENTRIES = 200;
const MEMORY_CACHE_MAX_BYTES = 100 * 1024 * 1024;

interface CachedObject {
  buffer: Buffer;
  mimeType: string;
  isPublic: boolean;
  etag: string;
  cachedAt: number;
}

const objectMemoryCache = new Map<string, CachedObject>();
let memoryCacheTotalBytes = 0;

function evictCacheIfNeeded(incomingBytes: number): void {
  while (
    (memoryCacheTotalBytes + incomingBytes > MEMORY_CACHE_MAX_BYTES ||
      objectMemoryCache.size >= MEMORY_CACHE_MAX_ENTRIES) &&
    objectMemoryCache.size > 0
  ) {
    const oldestKey = objectMemoryCache.keys().next().value as string;
    const entry = objectMemoryCache.get(oldestKey)!;
    memoryCacheTotalBytes -= entry.buffer.length;
    objectMemoryCache.delete(oldestKey);
  }
}

let storageClient: Client | null = null;

export function getStorageClient(): Client {
  if (!storageClient) {
    storageClient = new Client();
  }
  return storageClient;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private client: Client;

  constructor() {
    this.client = getStorageClient();
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    storagePath: string = "uploads",
    isPublic: boolean = true
  ): Promise<string> {
    const objectId = randomUUID();
    const extension = originalFilename.split(".").pop() || "bin";
    const normalizedPath = storagePath.replace(/^\/+|\/+$/g, "");
    const objectName = `${normalizedPath}/${objectId}.${extension}`;

    const result = await this.client.uploadFromBytes(objectName, buffer);
    if (!result.ok) {
      throw new Error(`Failed to upload file: ${result.error}`);
    }

    if (isPublic) {
      const aclPolicy: ObjectAclPolicy = {
        owner: "system",
        visibility: "public",
      };
      await setObjectAclPolicy(this.client, objectName, aclPolicy);
    }

    return `/objects/${objectName}`;
  }

  async uploadOptimizedImage(
    buffer: Buffer,
    originalFilename: string,
    storagePath: string = "uploads",
    imageType: 'banner' | 'thumbnail' | 'product_detail' = 'thumbnail',
    isPublic: boolean = true
  ): Promise<string> {
    if (!isImageFile(originalFilename)) {
      return this.uploadFile(buffer, originalFilename, storagePath, isPublic);
    }

    let optimizedResult;
    try {
      switch (imageType) {
        case 'banner':
          optimizedResult = await optimizeBannerImage(buffer);
          break;
        case 'product_detail':
          optimizedResult = await optimizeProductDetailImage(buffer);
          break;
        case 'thumbnail':
        default:
          optimizedResult = await optimizeThumbnailImage(buffer);
          break;
      }

      const newFilename = originalFilename.replace(/\.[^.]+$/, `.${optimizedResult.format}`);
      return this.uploadFile(optimizedResult.buffer, newFilename, storagePath, isPublic);
    } catch (error) {
      console.warn('[DEBUG uploadOptimizedImage] Optimization failed, uploading original:', error);
      return this.uploadFile(buffer, originalFilename, storagePath, isPublic);
    }
  }

  async getUploadSignedUrl(
    storagePath: string,
    extension: string
  ): Promise<{ signedUrl: string; objectPath: string }> {
    const objectId = randomUUID();
    const normalizedPath = storagePath.replace(/^\/+|\/+$/g, "");
    const objectName = `${normalizedPath}/${objectId}.${extension}`;

    throw new Error(
      "Signed URL generation is not supported with @replit/object-storage SDK. " +
        "Use direct upload via uploadFile method instead."
    );
  }

  async downloadObjectByPath(objectPath: string, res: Response): Promise<void> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const objectName = objectPath.slice("/objects/".length);
    const etag = `"${objectName}"`;

    const ifNoneMatch = res.req?.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }

    const cached = objectMemoryCache.get(objectName);
    if (cached) {
      objectMemoryCache.delete(objectName);
      objectMemoryCache.set(objectName, cached);

      res.set({
        "Content-Type": cached.mimeType,
        "Content-Length": String(cached.buffer.length),
        "Cache-Control": `${cached.isPublic ? "public" : "private"}, max-age=${CACHE_MAX_AGE_SECONDS}`,
        "ETag": cached.etag,
      });
      res.send(cached.buffer);
      return;
    }

    const existsResult = await this.client.exists(objectName);
    if (!existsResult.ok || !existsResult.value) {
      throw new ObjectNotFoundError();
    }

    const downloadResult = await this.client.downloadAsBytes(objectName);
    if (!downloadResult.ok) {
      throw new ObjectNotFoundError();
    }

    const fileBuffer = Array.isArray(downloadResult.value) 
      ? downloadResult.value[0] 
      : downloadResult.value;

    const mimeType = this.getMimeTypeFromPath(objectName);
    const aclPolicy = await getObjectAclPolicy(this.client, objectName);
    const isPublic = aclPolicy?.visibility === "public";

    evictCacheIfNeeded(fileBuffer.length);
    objectMemoryCache.set(objectName, {
      buffer: fileBuffer,
      mimeType,
      isPublic,
      etag,
      cachedAt: Date.now(),
    });
    memoryCacheTotalBytes += fileBuffer.length;

    res.set({
      "Content-Type": mimeType,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${CACHE_MAX_AGE_SECONDS}`,
      "ETag": etag,
    });
    res.send(fileBuffer);
  }

  async getObjectEntityFile(objectPath: string): Promise<{ objectName: string; exists: boolean }> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const objectName = objectPath.slice("/objects/".length);
    const existsResult = await this.client.exists(objectName);

    if (!existsResult.ok || !existsResult.value) {
      throw new ObjectNotFoundError();
    }

    return { objectName, exists: true };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("https://storage.googleapis.com/")) {
      const url = new URL(rawPath);
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const objectPath = pathParts.slice(1).join("/");
        return `/objects/${objectPath}`;
      }
    }

    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }

    const objectName = normalizedPath.slice("/objects/".length);
    const existsResult = await this.client.exists(objectName);
    
    if (!existsResult.ok || !existsResult.value) {
      return normalizedPath;
    }

    await setObjectAclPolicy(this.client, objectName, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectPath,
    requestedPermission,
  }: {
    userId?: string;
    objectPath: string;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    if (!objectPath.startsWith("/objects/")) {
      return false;
    }

    const objectName = objectPath.slice("/objects/".length);
    return canAccessObject({
      userId,
      client: this.client,
      objectName,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  async deleteObject(objectPath: string): Promise<void> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const objectName = objectPath.slice("/objects/".length);
    const result = await this.client.delete(objectName);

    if (!result.ok) {
      throw new Error(`Failed to delete object: ${result.error}`);
    }
  }

  async listObjects(prefix?: string): Promise<string[]> {
    const result = await this.client.list(prefix ? { prefix } : undefined);

    if (!result.ok) {
      throw new Error(`Failed to list objects: ${result.error}`);
    }

    return result.value.map((obj) => `/objects/${obj.name}`);
  }

  async prewarmCache(objectPaths: string[]): Promise<void> {
    const validPaths = objectPaths
      .filter(p => p && p.startsWith("/objects/"))
      .map(p => p.slice("/objects/".length));

    const uniquePaths = [...new Set(validPaths)];
    let loaded = 0;
    let failed = 0;

    const batchSize = 10;
    for (let i = 0; i < uniquePaths.length; i += batchSize) {
      const batch = uniquePaths.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (objectName) => {
          if (objectMemoryCache.has(objectName)) return;

          const downloadResult = await this.client.downloadAsBytes(objectName);
          if (!downloadResult.ok) return;

          const fileBuffer = Array.isArray(downloadResult.value)
            ? downloadResult.value[0]
            : downloadResult.value;

          const mimeType = this.getMimeTypeFromPath(objectName);
          const aclPolicy = await getObjectAclPolicy(this.client, objectName);
          const isPublic = aclPolicy?.visibility === "public";
          const etag = `"${objectName}"`;

          evictCacheIfNeeded(fileBuffer.length);
          objectMemoryCache.set(objectName, {
            buffer: fileBuffer,
            mimeType,
            isPublic,
            etag,
            cachedAt: Date.now(),
          });
          memoryCacheTotalBytes += fileBuffer.length;
          loaded++;
        })
      );

      results.forEach(r => { if (r.status === 'rejected') failed++; });
    }

    console.log(`[Cache Prewarm] Loaded ${loaded} objects, ${failed} failed, ${objectMemoryCache.size} total cached (${(memoryCacheTotalBytes / 1024 / 1024).toFixed(1)}MB)`);
  }

  private getMimeTypeFromPath(objectPath: string): string {
    const extension = objectPath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      bmp: "image/bmp",
      ico: "image/x-icon",
      pdf: "application/pdf",
      json: "application/json",
      txt: "text/plain",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
    };
    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}
