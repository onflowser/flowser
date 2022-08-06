import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { CollectionGuaranteeEntity } from "./collection-guarantee.entity";
import { FlowBlock } from "../../flow/services/flow-gateway.service";
import { Block } from "@flowser/types/generated/blocks";

@Entity({ name: "blocks" })
export class BlockEntity extends PollingEntity implements Block {
  @PrimaryColumn()
  id: string;

  @Column()
  parentId: string;

  @Column()
  height: number;

  @Column()
  timestamp: string;

  @Column("simple-json")
  collectionGuarantees: CollectionGuaranteeEntity[];

  // TODO(milestone-2): define type
  @Column("simple-json")
  blockSeals: any[];

  @Column("simple-array")
  signatures: string[];

  static create(flowBlock: FlowBlock): BlockEntity {
    return Object.assign(new BlockEntity(), Block.fromJSON(flowBlock));
  }
}
