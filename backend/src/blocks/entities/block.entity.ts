import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { FlowBlock } from "../../flow/services/flow-gateway.service";
import { Block, CollectionGuarantee } from "@flowser/types";
import { typeOrmProtobufTransformer } from "../../utils";

@Entity({ name: "blocks" })
export class BlockEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  parentId: string;

  @Column()
  height: number;

  @Column("datetime")
  timestamp: Date;

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(CollectionGuarantee),
  })
  collectionGuarantees: CollectionGuarantee[];

  // TODO(milestone-x): Define type (Note: we aren't showing blockSeals anywhere)
  @Column("simple-json")
  blockSeals: any[];

  @Column("simple-array")
  signatures: string[];

  static create(flowBlock: FlowBlock): BlockEntity {
    const block = new BlockEntity();
    block.id = flowBlock.id;
    block.collectionGuarantees = flowBlock.collectionGuarantees;
    block.blockSeals = flowBlock.blockSeals;
    block.signatures = flowBlock.signatures;
    block.timestamp = new Date(flowBlock.timestamp);
    block.height = flowBlock.height;
    block.parentId = flowBlock.parentId;
    return block;
  }

  toProto() {
    return Block.fromPartial({
      id: this.id,
      parentId: this.parentId,
      height: this.height,
      timestamp: this.timestamp.toISOString(),
      blockSeals: this.blockSeals,
      signatures: this.signatures,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }
}
