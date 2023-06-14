// Should be implemented by entities that are tied to a specific block.
export interface BlockContextEntity {
  blockId: string;
}

export function implementsBlockContext(
  object: unknown
): object is BlockContextEntity {
  if (typeof object !== "object") {
    return false;
  }
  return "blockId" in object;
}
