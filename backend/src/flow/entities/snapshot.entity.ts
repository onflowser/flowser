import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { EmulatorSnapshot } from "@flowser/shared";

@Entity()
export class SnapshotEntity extends PollingEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  description!: string;

  @Column()
  blockId!: string;

  // Set to nullable for backward compatability
  @Column({ nullable: true })
  projectId!: string | null;

  toProto(): EmulatorSnapshot {
    return {
      id: this.id,
      description: this.description,
      blockId: this.blockId,
      projectId: this.projectId ?? "",
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
