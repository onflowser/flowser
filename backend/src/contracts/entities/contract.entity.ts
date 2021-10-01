import { PollingEntity } from '../../shared/entities/polling.entity';
import { Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'contracts' })
export class Contract extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;
}
