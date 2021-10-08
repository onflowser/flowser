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

    findOne(id: string) {
        return this.blockRepository.findOne(id);
    }

    update(id: string, updateBlockDto: UpdateBlockDto) {
        return `This action updates a #${id} block`;
    }

    remove(id: string) {
        return `This action removes a #${id} block`;
    }
}
