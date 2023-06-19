import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { EmulatorSnapshot } from "@flowser/shared";
import { BlockContextEntity } from "../../blocks/entities/block-context.entity";

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
