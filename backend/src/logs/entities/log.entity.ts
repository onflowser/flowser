import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Log extends PollingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  static create(lineData: string) {
    const log = new Log();
    log.data = lineData;
    return log;
  }
}
