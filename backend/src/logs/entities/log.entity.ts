import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Log, LogSource } from "@flowser/types/generated/entities/logs";

@Entity()
export class LogEntity extends PollingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  source: LogSource;

  @Column()
  data: string;

  toProto(): Log {
    return {
      id: this.id,
      source: this.source,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static create(source: LogSource, lineData: string) {
    const log = new LogEntity();
    log.source = source;
    log.data = lineData;
    return log;
  }
}
