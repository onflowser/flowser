import { Column, Entity } from "typeorm";
import { CollectionGuarantee } from "@flowser/types/generated/blocks";

@Entity({ name: "collection-guarantees" })
export class CollectionGuaranteeEntity implements CollectionGuarantee {
  @Column()
  collectionId: string;

  @Column("simple-array")
  signatures: string[];
}
