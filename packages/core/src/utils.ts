export function isDefined<Value>(
  value: Value | null | undefined,
): value is Value {
  return value !== null && value !== undefined;
}

export function waitForMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function ensurePrefixedAddress(address: string | null | undefined) {
  return address?.startsWith("0x") ? address : `0x${address}`;
}

export function ensureNonPrefixedAddress(address: string | null | undefined) {
  return address?.startsWith("0x") ? address.slice(2, address.length) : address;
}

export type EntitiesDiff<T> = {
  created: T[];
  updated: T[];
  deleted: T[];
};

type PrimaryKey<Entity> = keyof Entity | (keyof Entity)[];

export function computeEntitiesDiff<Entity>(props: {
  primaryKey: PrimaryKey<Entity>;
  oldEntities: Entity[];
  newEntities: Entity[];
  deepCompare?: boolean;
}): EntitiesDiff<Entity> {
  const newEntitiesLookup = new Map(
    props.newEntities.map((entity) => [
      stringifyPrimaryKey(props.primaryKey, entity),
      entity,
    ]),
  );
  const oldEntitiesLookup = new Map(
    props.oldEntities.map((entity) => [
      stringifyPrimaryKey(props.primaryKey, entity),
      entity,
    ]),
  );

  const created = [];
  const updated = [];
  const deleted = [];
  for (const [primaryKey, entity] of newEntitiesLookup) {
    const isExistingEntity = oldEntitiesLookup.has(primaryKey);
    if (!isExistingEntity) {
      created.push(entity);
    }

    if (!props.deepCompare) {
      updated.push(entity);
    }

    if (!areDeepEqualEntities(oldEntitiesLookup.get(primaryKey), entity)) {
      updated.push(entity);
    }
  }
  for (const [primaryKey, entity] of oldEntitiesLookup) {
    if (!newEntitiesLookup.has(primaryKey)) {
      deleted.push(entity);
    }
  }

  return { created, updated, deleted };
}

function stringifyPrimaryKey<Entity>(
  primaryKey: PrimaryKey<Entity>,
  entity: Entity,
): string {
  // Single primary key.
  if (typeof primaryKey === "string") {
    return String(entity[primaryKey]);
  }

  // Composed primary key
  if (primaryKey instanceof Array) {
    return primaryKey.map((key) => String(entity[key])).join(",");
  }

  throw new Error("Invalid primary key: " + JSON.stringify(primaryKey));
}

type ProcessEntitiesDiffOptions<T> = {
  create: (entity: T) => Promise<any>;
  update: (entity: T) => Promise<any>;
  delete: (entity: T) => Promise<any>;
  diff: EntitiesDiff<T>;
};

export async function processEntitiesDiff<T>(
  opts: ProcessEntitiesDiffOptions<T>,
) {
  const promises = [];
  for (const entity of opts.diff.created) {
    promises.push(opts.create(entity));
  }
  for (const entity of opts.diff.updated) {
    promises.push(opts.update(entity));
  }
  for (const entity of opts.diff.deleted) {
    promises.push(opts.delete(entity));
  }
  return Promise.all(promises);
}

function areDeepEqualEntities<Entity>(
  firstEntity: Entity,
  secondEntity: Entity,
) {
  // Entities may have createdAt and updatedAt fields (if they are a subclass of PollingEntity)
  // We shouldn't compare those fields, because we are interested only in other attributes
  const firstData = JSON.stringify({
    ...firstEntity,
    createdAt: null,
    updatedAt: null,
  });
  const secondData = JSON.stringify({
    ...secondEntity,
    createdAt: null,
    updatedAt: null,
  });
  return firstData === secondData;
}
