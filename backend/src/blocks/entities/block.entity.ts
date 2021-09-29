import { Column, Entity, ObjectID, ObjectIdColumn, } from 'typeorm';
import { PollingEntity } from '../../shared/entities/polling.entity';

@Entity({name: 'blocks'})
export class Block extends PollingEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    id: string;

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
}
