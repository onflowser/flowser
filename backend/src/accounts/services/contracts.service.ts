import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import { Account } from "../entities/account.entity";
import { AccountContract } from "../entities/contract.entity";
import { exec } from 'child_process';
import { toArray } from 'rxjs';
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

@Injectable()
export class ContractsService {


    constructor(
        @InjectRepository(Account)
        private accountRepository: MongoRepository<Account>
    ) {
    }

    create(createContractDto: CreateContractDto) {
        return this.accountRepository.save(createContractDto);
    }

    async findAll() {
        return this._findAll();
    }

    async findAllNewerThanTimestamp(timestamp): Promise<AccountContract[]> {
        return this._findAll([
            {$match: {'createdAt': {$gt: timestamp}}},
        ])
    }

    findOne(id: string) {
        return this._findAll([
            {$match: {'_id': {$eq: id}}}
        ])
    }

    findOneByName(name: string) {
        return this._findAll([
            {$match: {'name': name}}
        ])
    }

    update(id: string, updateContractDto: UpdateContractDto) {
        return `This action updates a #${id} contract`;
    }

    remove(id: string) {
        return `This action removes a #${id} contract`;
    }

    async _findAll(pipeline: ObjectLiteral[] = []) {
        return this.accountRepository.aggregate([
            {
                $project: {
                    address: 1,
                    contracts: {
                        $map: {
                            input: "$contracts",
                            as: "contract",
                            in: {
                                "$mergeObjects": [
                                    "$$contract",
                                    {accountAddress: "$address"}
                                ]
                            }
                        }
                    }
                }
            },
            {$unwind: "$contracts"},
            {$replaceRoot: {newRoot: "$contracts"}},
            ...pipeline
        ]).toArray()
    }
}

// TODO(jernej): how to perform this logic with mongodb queries ?
// this is not as performant + I don't know how to select contracts._id field
function serializeAccountContracts(accounts: Account[]) {
    return accounts.map(account =>
        account.contracts.map(contract =>
            ({accountAddress: account.address, ...contract})
        )
    ).flat()
}
