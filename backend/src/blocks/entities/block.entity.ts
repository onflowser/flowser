import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity({name: 'blocks'})
export class Block {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    parentId: string;

    @Column()
    height: number;

    @Column()
    timestamp: string;

    @Column()
    collectionGuarantees: any[]; // TODO

    @Column()
    blockSeals: any[]; // TODO

    @Column()
    signatures: any[]; // TODO

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: number;
}
