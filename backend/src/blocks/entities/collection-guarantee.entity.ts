import { Column, Entity } from "typeorm";

@Entity({ name: "collection-guarantees" })
export class CollectionGuarantee {
  @Column()
  collectionId: string;

  @Column("simple-array")
  signatures: string[];
}
