import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { CollectionGuarantee } from "./collection-guarantee.entity";
import { FlowBlock } from "../../flow/services/flow-gateway.service";

@Entity({ name: "blocks" })
export class Block extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  parentId: string;

  @Column()
  height: number;

  @Column()
  timestamp: string;

  @Column("simple-json")
  collectionGuarantees: CollectionGuarantee[];

  // TODO(milestone-2): define type
  @Column("simple-json")
  blockSeals: any[];

  @Column("simple-array")
  signatures: string[];

  static create(flowBlock: FlowBlock): Block {
    return Object.assign(new Block(), flowBlock);
  }
}
