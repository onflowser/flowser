import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Log extends PollingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  constructor(data: string) {
    super();
    this.data = data;
  }
}
