import { computeEntitiesDiff } from "./common-utils";

describe("Utils", function () {
  it("should compute entities diff using deep compare", function () {
    const oldEntities = [
      {
        createdAt: "2023-06-20T10:02:04.989Z",
        updatedAt: "2023-06-20T10:02:04.989Z",
        pathIdentifier: "test",
        pathDomain: 3,
        data: { value: "New Test" },
        accountAddress: "0xf8d6e0586b0a20c7",
        id: "0xf8d6e0586b0a20c7/storage/test",
      },
    ];
    const newEntities = [
      {
        createdAt: "2023-06-20T10:02:20.304Z",
        updatedAt: "2023-06-20T10:02:20.304Z",
        pathIdentifier: "test",
        pathDomain: 3,
        data: { value: "New Test Updated" },
        accountAddress: "0xf8d6e0586b0a20c7",
        id: "0xf8d6e0586b0a20c7/storage/test",
      },
    ];
    const { created, updated, deleted } = computeEntitiesDiff({
      primaryKey: "id",
      oldEntities: oldEntities,
      newEntities: newEntities,
      deepCompare: true,
    });

    expect(created).toHaveLength(0);
    expect(updated).toHaveLength(1);
    expect(deleted).toHaveLength(0);
  });
});
