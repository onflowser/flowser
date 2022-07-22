import { Column, Entity } from "typeorm";

@Entity({ name: "storage" })
export class AccountsStorage {
  @Column()
  blockHeight: number;

  @Column()
  name: string;

  @Column()
  value: string;
}
