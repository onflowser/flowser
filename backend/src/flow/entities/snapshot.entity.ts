import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { EmulatorSnapshot } from "@flowser/shared";
import { BlockContextEntity } from "../../blocks/entities/block-context.entity";
import { PollingEntityInitArguments } from "../../utils/type-utils";

type SnapshotEntityInitArgs = PollingEntityInitArguments<SnapshotEntity>;

@Entity()
export class SnapshotEntity
  extends PollingEntity
  implements BlockContextEntity
{
  // aka. "snapshot name"
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @Column()
  blockId: string;

  // Set to nullable for backward compatability
  @Column({ nullable: true })
  projectId: string;

  // Entities are also automatically initialized by TypeORM.
  // In those cases no constructor arguments are provided.
  constructor(args: SnapshotEntityInitArgs | undefined) {
    super();
    this.id = args?.id ?? "";
    this.description = args?.description ?? "";
    this.blockId = args?.blockId ?? "";
    this.projectId = args?.projectId ?? "";
  }

  toProto(): EmulatorSnapshot {
    return {
      id: this.id,
      description: this.description,
      blockId: this.blockId,
      projectId: this.projectId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
