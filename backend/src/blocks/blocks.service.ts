import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

export class BlocksService {

    constructor(@InjectRepository(Block)
                private blockRepository: MongoRepository<Block>) {
    }

    async create(createBlockDto: CreateBlockDto): Promise<Block> {
        return this.blockRepository.save(createBlockDto);
    }

    findAll(): Promise<Block[]> {
        return this.blockRepository.find();
    }

    findAllNewerThanTimestamp(timestamp): Promise<Block[]> {
        return this.blockRepository.find({
            where: {createdAt: {$gt: timestamp}}
        });
    }

    findLastBlock(): Promise<Block> {
        return this.blockRepository.findOne({
            order: {height: 'DESC'},
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
