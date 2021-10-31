import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class Log extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  data: string;
}
