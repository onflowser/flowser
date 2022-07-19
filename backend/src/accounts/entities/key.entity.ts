import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { PollingEntity } from '../../shared/entities/polling.entity';

@Entity({ name: 'keys' })
export class AccountKey extends PollingEntity {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    index: number;

    @Column()
    publicKey: string;

    @Column()
    signAlgo: number;

    @Column()
    hashAlgo: number;

    @Column()
    weight: number;

    @Column()
    sequenceNumber: number;

    @Column()
    revoked: boolean;

    static init(flowAccountKeyObject: any) {
        return Object.assign<AccountKey, any>(new AccountKey(), flowAccountKeyObject);
    }
}
