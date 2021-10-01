import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { GatewayConfiguration } from './gateway-configuration';

@Entity({name: 'projects'})
export class Project {
    @ObjectIdColumn()
    _id: string;

    @Column()
    name: string;

    @Column()
    gateway: GatewayConfiguration;

    @Column()
    isQuickStart: boolean = false;
}
