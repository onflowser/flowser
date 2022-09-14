import { Column, Entity } from "typeorm";

@Entity()
export class PollingEntity {
  @Column("datetime")
  createdAt = new Date();

  @Column("datetime")
  updatedAt = new Date();

  public markUpdated() {
    this.updatedAt = new Date();
  }
}
