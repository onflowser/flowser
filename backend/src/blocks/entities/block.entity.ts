import { Column, Entity, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../shared/entities/polling.entity";
import { CollectionGuarantee } from "./collection-guarantee.entity";

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

  @Column((type) => CollectionGuarantee)
  collectionGuarantees: CollectionGuarantee[];

  @Column("simple-json")
  blockSeals: any[];

  @Column("simple-array")
  signatures: string[];

  static init(flowBlockObject): Block {
    return Object.assign(new Block(), flowBlockObject);
  }
}
