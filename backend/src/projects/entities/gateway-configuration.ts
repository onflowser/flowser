import { Column, Entity } from 'typeorm';

@Entity()
export class GatewayConfiguration {
    @Column()
    port: number;

    @Column()
    network: string;

    @Column()
    address: string;
}
