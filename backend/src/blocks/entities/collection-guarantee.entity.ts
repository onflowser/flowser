import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: "collection-guarantees" })
export class CollectionGuarantee {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  collectionId: string;

  @Column()
  signatures: string[];
}
