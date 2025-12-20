import { Client } from "@replit/object-storage";

const ACL_METADATA_PREFIX = "acl_";

export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

abstract class BaseObjectAccessGroup implements ObjectAccessGroup {
  constructor(
    public readonly type: ObjectAccessGroupType,
    public readonly id: string
  ) {}

  public abstract hasMember(userId: string): Promise<boolean>;
}

function createObjectAccessGroup(
  group: ObjectAccessGroup
): BaseObjectAccessGroup {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

const aclCache = new Map<string, ObjectAclPolicy>();

export async function setObjectAclPolicy(
  client: Client,
  objectName: string,
  aclPolicy: ObjectAclPolicy
): Promise<void> {
  const aclObjectName = `${ACL_METADATA_PREFIX}${objectName}.json`;
  const aclContent = JSON.stringify(aclPolicy);

  const result = await client.uploadFromText(aclObjectName, aclContent);
  if (!result.ok) {
    throw new Error(`Failed to set ACL policy: ${result.error}`);
  }

  aclCache.set(objectName, aclPolicy);
}

export async function getObjectAclPolicy(
  client: Client,
  objectName: string
): Promise<ObjectAclPolicy | null> {
  const cached = aclCache.get(objectName);
  if (cached) {
    return cached;
  }

  const aclObjectName = `${ACL_METADATA_PREFIX}${objectName}.json`;

  const existsResult = await client.exists(aclObjectName);
  if (!existsResult.ok || !existsResult.value) {
    return null;
  }

  const downloadResult = await client.downloadAsText(aclObjectName);
  if (!downloadResult.ok) {
    return null;
  }

  try {
    const aclPolicy = JSON.parse(downloadResult.value) as ObjectAclPolicy;
    aclCache.set(objectName, aclPolicy);
    return aclPolicy;
  } catch {
    return null;
  }
}

export async function canAccessObject({
  userId,
  client,
  objectName,
  requestedPermission,
}: {
  userId?: string;
  client: Client;
  objectName: string;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(client, objectName);
  if (!aclPolicy) {
    return true;
  }

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (aclPolicy.owner === userId) {
    return true;
  }

  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}
