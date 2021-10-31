import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'storage' })
export class AccountsStorage {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    blockHeight: number;

    @Column()
    name: string;

    @Column()
    value: string;
}
