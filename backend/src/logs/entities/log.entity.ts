import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Log } from "@flowser/types";

@Entity()
export class LogEntity extends PollingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  toProto() {
    return Log.fromPartial({
      id: this.id,
      data: this.data,
    });
  }

  static create(lineData: string) {
    const log = new LogEntity();
    log.data = lineData;
    return log;
  }
}
