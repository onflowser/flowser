import { PollingEntity } from "../../common/entities/polling.entity";
import { AfterLoad, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Account } from "./account.entity";
import { BadRequestException } from "@nestjs/common";

@Entity({ name: "contracts" })
export class AccountContract extends PollingEntity {
  // Encodes both accountAddress and name into the id.
  id: string;

  @PrimaryColumn()
  accountAddress: string;

  @PrimaryColumn()
  name: string;

  @Column("mediumtext")
  code: string;

  @ManyToOne(() => Account, (account) => account.contracts)
  account: Account;

  public static parseId(id: string) {
    const idParts = id.split(".");
    if (idParts.length !== 2) {
      throw new BadRequestException("Invalid contract id");
    }
    const [accountAddress, name] = idParts;
    return { accountAddress, name };
  }

  @AfterLoad()
  private computeId() {
    this.id = `${this.accountAddress}.${this.name}`;
  }

  static init(accountAddress: string, name: string, code: string) {
    return Object.assign<AccountContract, any>(new AccountContract(), {
      id: `${accountAddress}.${name}`,
      name,
      code,
    });
  }
}
