import { Column, Entity } from "typeorm";

@Entity()
export class GatewayConfigurationEntity {
  @Column({ nullable: true })
  port: number;

  @Column()
  address: string;

  constructor(address: string, port: number) {
    this.port = port;
    this.address = address;
  }

  url() {
    const { address, port } = this;
    const host = `${address}${port ? `:${port}` : ""}`;
    return host.startsWith("http") ? host : `http://${host}`;
  }
}
