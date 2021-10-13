import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { GatewayConfigurationEntity } from './gateway-configuration.entity';

@Entity({name: 'projects'})
export class Project {
    @ObjectIdColumn()
    _id: string;

    @Column()
    name: string;

    @Column()
    gateway: GatewayConfigurationEntity;

    // data will be fetched from this block height
    // leave this undefined to start fetching from latest block
    @Column()
    startBlockHeight?: number;
}
