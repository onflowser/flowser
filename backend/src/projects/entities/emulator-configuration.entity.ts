import { Column, Entity } from "typeorm";

@Entity()
export class EmulatorConfigurationEntity {
  @Column()
  verboseLogging: boolean;

  @Column()
  httpServerPort: number;

  @Column()
  rpcServerPort: number;

  @Column()
  persist: boolean;
}
