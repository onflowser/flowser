import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { Block, CollectionGuarantee } from "@flowser/shared";
import { typeOrmProtobufTransformer } from "../../utils/common-utils";
import { BlockContextEntity } from "./block-context.entity";

@Entity({ name: "blocks" })
export class BlockEntity extends PollingEntity implements BlockContextEntity {
  // Use the old name for database column for backward compatability.
  @PrimaryColumn({ name: "id" })
  blockId: string;

  @Column()
  parentId: string;

  @Column()
  blockHeight: number;

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

  toProto(): Block {
    return {
      id: this.blockId,
      parentId: this.parentId,
      height: this.blockHeight,
      timestamp: this.timestamp.toISOString(),
      blockSeals: this.blockSeals,
      signatures: this.signatures,
      collectionGuarantees: this.collectionGuarantees,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
