import { PollingEntity } from '../../shared/entities/polling.entity';
import { Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'events' })
export class Event extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;
}
