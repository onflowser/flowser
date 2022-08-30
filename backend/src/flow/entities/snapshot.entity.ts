import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";

@Entity()
export class SnapshotEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @Column()
  blockId: string;
}
