import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../entities/account.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class AccountsService {

    constructor (
        @InjectRepository(Account)
        private accountRepository: MongoRepository<Account>
    ) {
    }

    create (createAccountDto: CreateAccountDto) {
        return this.accountRepository.save(createAccountDto);
    }

    findAll () {
        return this.accountRepository.find({
            order: {createdAt: "DESC", updatedAt: "DESC"}
        });
    }

    findAllNewerThanTimestamp (timestamp): Promise<Account[]> {
        return this.accountRepository.aggregate([
            { $match: { createdAt: { $gt: timestamp } } },
            {
                $lookup: {
                    from: "transactions",
                    let: { address: "$address" },
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr: {
                                        $eq: [{ $concat: ["0x", "$payer"] }, "$$address"]
                                    }
                                }
                        },
                        { $count: "count" },
                    ],
                    as: "txCount"
                }
            },
            {
                $unwind: {
                    path: "$txCount",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    createdAt: 1,
                    updatedAt: 1,
                    address: 1,
                    balance: 1,
                    code: 1,
                    keys: 1,
                    contracts: 1,
                    "txCount": "$txCount.count"
                }
            },
            // TODO: how to solve re-fetching updated entities
            { $sort: { createdAt: -1 }}
        ]).toArray()

    }

    async findOne (id: string) {
        const [account] = await this.accountRepository.find({ where: { id } });
        if (account) {
            return account;
        } else {
            throw new NotFoundException("Account not found")
        }
    }

    async findOneByAddress (address: string) {
        const account = await this.accountRepository.findOne({ where: { address } });
        if (account) {
            return account;
        } else {
            throw new NotFoundException("Account not found")
        }
    }

    update (address: string, updateAccountDto: UpdateAccountDto) {
        // we refetch and insert the whole account entity
        // contracts & keys can be added or removed
        // therefore collection needs to be replaced and not just updated
        return this.accountRepository.replaceOne(
            { address },
            { ...updateAccountDto, updatedAt: new Date() },
            // TODO: why default emulator-account creation event is not logged inside a transaction ?
            // this is why we need to create new account if account doesn't exists (edge case)
            { upsert: true }
        );
    }
}
