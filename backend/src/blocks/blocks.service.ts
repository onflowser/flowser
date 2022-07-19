import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { NotFoundException } from '@nestjs/common';

export class BlocksService {
    constructor(
        @InjectRepository(Block)
        private blockRepository: MongoRepository<Block>,
    ) {}

    async create(createBlockDto: CreateBlockDto): Promise<Block> {
        return this.blockRepository.save(createBlockDto);
    }

    findAll(): Promise<Block[]> {
        return this.blockRepository.find();
    }

    findAllNewerThanTimestamp(timestamp): Promise<Block[]> {
        return this.blockRepository.find({
            where: {
                $or: [{ createdAt: { $gt: timestamp } }, { updatedAt: { $gt: timestamp } }],
            },
            order: { height: 'DESC' },
        });
    }

    findLastBlock(): Promise<Block> {
        return this.blockRepository.findOne({
            order: { height: 'DESC' },
        });
    }

    async findOne(id: string) {
        const [block] = await this.blockRepository.find({ where: { id: id } });
        if (block) {
            return block;
        } else {
            throw new NotFoundException('Block not found');
        }
    }

    removeAll() {
        return this.blockRepository.delete({});
    }
}
