import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../entities/account.entity";
import { MongoRepository } from "typeorm";
import { Transaction } from '../../transactions/entities/transaction.entity';

@Injectable()
export class AccountsService {

    constructor (
        @InjectRepository(Account)
        private accountRepository: MongoRepository<Account>,
        @InjectRepository(Transaction)
        private transactionRepository: MongoRepository<Transaction>
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
            {
                $match: {
                    $or: [
                        {createdAt: {$gt: timestamp}},
                        {updatedAt: {$gt: timestamp}},
                    ]
                }
            },
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
                    id: 1,
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
            {
                $addFields: {
                    "txCount": {
                        $ifNull: [
                            "$txCount",
                            "0"
                        ]
                    }
                }
            },
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
            const addressWithout0x = account.address.substr(2);
            const transactions = await this.transactionRepository
                .aggregate([
                    {$match: {payer: addressWithout0x}},
                    {$project: {_id: 0}}
                ]).toArray();

            return {...account, transactions};
        } else {
            throw new NotFoundException("Account not found")
        }
    }

    replace (address: string, updateAccountDto: UpdateAccountDto) {
        // refetch and insert the whole account entity
        // contracts & keys can be added or removed
        // therefore collection needs to be replaced and not just updated
        return this.accountRepository.replaceOne(
            { address },
            { ...updateAccountDto, updatedAt: new Date().getTime() },
            // create new account if account doesn't exists
            { upsert: true }
        );
    }

    update(address: string, updateAccountDto: UpdateAccountDto) {
        return this.accountRepository.update({ address }, {
            ...updateAccountDto,
            updatedAt: new Date().getTime()
        })
    }

    removeAll() {
        return this.accountRepository.delete({});
    }
}
