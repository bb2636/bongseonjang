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
const CACHE_MAX_AGE_SECONDS = 604800;

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
    console.log('[DEBUG uploadFile] originalFilename:', originalFilename);
    console.log('[DEBUG uploadFile] storagePath:', storagePath);
    console.log('[DEBUG uploadFile] buffer length:', buffer.length);
    console.log('[DEBUG uploadFile] buffer type:', typeof buffer);
    console.log('[DEBUG uploadFile] isBuffer:', Buffer.isBuffer(buffer));
    
    const objectId = randomUUID();
    const extension = originalFilename.split(".").pop() || "bin";
    const normalizedPath = storagePath.replace(/^\/+|\/+$/g, "");
    const objectName = `${normalizedPath}/${objectId}.${extension}`;
    
    console.log('[DEBUG uploadFile] objectName:', objectName);

    const result = await this.client.uploadFromBytes(objectName, buffer);
    console.log('[DEBUG uploadFile] uploadResult:', JSON.stringify(result));
    
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

    console.log('[DEBUG uploadOptimizedImage] imageType:', imageType);
    console.log('[DEBUG uploadOptimizedImage] original size:', buffer.length);

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

      console.log('[DEBUG uploadOptimizedImage] optimized size:', optimizedResult.optimizedSize);
      console.log('[DEBUG uploadOptimizedImage] compression ratio:', 
        ((1 - optimizedResult.optimizedSize / optimizedResult.originalSize) * 100).toFixed(1) + '%');

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
    console.log('[DEBUG downloadObjectByPath] objectPath:', objectPath);
    
    if (!objectPath.startsWith("/objects/")) {
      console.log('[DEBUG downloadObjectByPath] Invalid path - does not start with /objects/');
      throw new ObjectNotFoundError();
    }

    const objectName = objectPath.slice("/objects/".length);
    console.log('[DEBUG downloadObjectByPath] objectName:', objectName);

    const existsResult = await this.client.exists(objectName);
    console.log('[DEBUG downloadObjectByPath] existsResult:', JSON.stringify(existsResult));
    
    if (!existsResult.ok || !existsResult.value) {
      console.log('[DEBUG downloadObjectByPath] Object does not exist');
      throw new ObjectNotFoundError();
    }

    const downloadResult = await this.client.downloadAsBytes(objectName);
    console.log('[DEBUG downloadObjectByPath] downloadResult.ok:', downloadResult.ok);
    
    if (!downloadResult.ok) {
      console.log('[DEBUG downloadObjectByPath] Download failed');
      throw new ObjectNotFoundError();
    }

    // SDK returns Array with Buffer at index 0
    const fileBuffer = Array.isArray(downloadResult.value) 
      ? downloadResult.value[0] 
      : downloadResult.value;
    
    console.log('[DEBUG downloadObjectByPath] fileBuffer length:', fileBuffer.length);

    const mimeType = this.getMimeTypeFromPath(objectName);
    const aclPolicy = await getObjectAclPolicy(this.client, objectName);
    const isPublic = aclPolicy?.visibility === "public";

    console.log('[DEBUG downloadObjectByPath] mimeType:', mimeType);
    console.log('[DEBUG downloadObjectByPath] Content-Length:', fileBuffer.length);

    res.set({
      "Content-Type": mimeType,
      "Content-Length": fileBuffer.length,
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${CACHE_MAX_AGE_SECONDS}`,
      "ETag": `"${objectName}-${fileBuffer.length}"`,
    });

    res.send(fileBuffer);
    console.log('[DEBUG downloadObjectByPath] Response sent successfully');
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
