import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { EmulatorSnapshot } from "@flowser/shared";

@Entity()
export class SnapshotEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @Column()
  blockId: string;

  toProto(): EmulatorSnapshot {
    return {
      id: this.id,
      description: this.description,
      blockId: this.blockId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
