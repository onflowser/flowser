import { PollingEntity } from "../../common/entities/polling.entity";
import { AfterLoad, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { BadRequestException } from "@nestjs/common";
import { env } from "../../config";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount } from "../../flow/services/flow-gateway.service";
import { AccountContract } from "@flowser/types/generated/accounts";

@Entity({ name: "contracts" })
export class AccountContractEntity
  extends PollingEntity
  implements AccountContract
{
  // Encodes both accountAddress and name into the id.
  id: string;

  @PrimaryColumn()
  accountAddress: string;

  @PrimaryColumn()
  name: string;

  @Column(getCodeFieldType())
  code: string;

  @ManyToOne(() => AccountEntity, (account) => account.contracts)
  account: AccountEntity;

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

  static create(account: FlowAccount, name: string, code: string) {
    return Object.assign<AccountContractEntity, any>(
      new AccountContractEntity(),
      {
        accountAddress: ensurePrefixedAddress(account.address),
        name,
        code,
      }
    );
  }
}

function getCodeFieldType() {
  return ["mariadb", "mysql"].includes(env.DATABASE_TYPE)
    ? "mediumtext"
    : "text";
}
