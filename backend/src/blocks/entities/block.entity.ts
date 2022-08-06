import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { FlowBlock } from "../../flow/services/flow-gateway.service";
import { Block, CollectionGuarantee } from "@flowser/types/generated/blocks";
import { typeOrmProtobufTransformer } from "../../utils";

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

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(CollectionGuarantee),
  })
  collectionGuarantees: CollectionGuarantee[];

  // TODO(milestone-2): define type
  @Column("simple-json")
  blockSeals: any[];

  @Column("simple-array")
  signatures: string[];

  static create(flowBlock: FlowBlock): BlockEntity {
    return Object.assign(new BlockEntity(), Block.fromJSON(flowBlock));
  }
}
