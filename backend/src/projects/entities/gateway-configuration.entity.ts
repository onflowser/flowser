import { Column, Entity } from 'typeorm';

@Entity()
export class GatewayConfigurationEntity {
    @Column()
    port: number;

    @Column()
    address: string;

    constructor (address: string, port: number) {
        this.port = port;
        this.address = address;
    }

}
