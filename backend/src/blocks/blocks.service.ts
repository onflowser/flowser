import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Block } from './entities/block.entity';
import { Interval } from '@nestjs/schedule';
import { FlowGatewayService } from '../shared/services/flow-gateway/flow-gateway.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

export class BlocksService {

    constructor(@InjectRepository(Block)
                private blockRepository: MongoRepository<Block>,
                private flowGatewayService: FlowGatewayService) {
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

    @Interval(5000) // TODO: Move to configuration
    async fetchDataFromDataSource(): Promise<void> {
        const block = await this.flowGatewayService.fetchBlocks();
        return await this.blockRepository.save(block);
    }
}
