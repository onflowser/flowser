import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Log } from "@flowser/types/generated/logs";

@Entity()
export class LogEntity extends PollingEntity implements Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  static create(lineData: string) {
    return Object.assign(new LogEntity(), Log.fromJSON({ data: lineData }));
  }
}
