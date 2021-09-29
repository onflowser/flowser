import { Injectable } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Block } from './entities/block.entity';

@Injectable()
export class BlocksService {

    constructor(@InjectRepository(Block)
                private blockRepository: MongoRepository<Block>) {
    }

    create(createBlockDto: CreateBlockDto) {
        return 'This action adds a new block';
    }

    findAll(): Promise<Block[]> {
        return this.blockRepository.find();
    }

    findAllNewerThanTimestamp(timestamp): Promise<Block[]> {
        return this.blockRepository.find({
            where: {createdAt: {$gt: timestamp}}
        });
    }


    findOne(id: number) {
        return `This action returns a #${id} block`;
    }

    update(id: number, updateBlockDto: UpdateBlockDto) {
        return `This action updates a #${id} block`;
    }

    remove(id: number) {
        return `This action removes a #${id} block`;
    }
}
