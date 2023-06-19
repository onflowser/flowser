import { Repository } from "typeorm";

// Should be implemented by entities that are tied to a specific block.
export interface BlockContextEntity {
  blockId: string;
}

export async function removeByBlockIds(options: {
  blockIds: string[];
  repository: Repository<BlockContextEntity>;
}) {
  const { blockIds, repository } = options;

  return repository
    .createQueryBuilder()
    .delete()
    .where(`blockId IN (${blockIds.map((id) => `'${id}'`).join(", ")})`)
    .execute();
}

export function implementsBlockContext(
  object: unknown
): object is BlockContextEntity {
  if (typeof object !== "object") {
    return false;
  }
  return "blockId" in object;
}
