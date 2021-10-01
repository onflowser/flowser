import { PollingEntity } from '../../shared/entities/polling.entity';
import { Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'accounts' })
export class Account extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;
}
