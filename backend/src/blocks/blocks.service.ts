import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { BlockEntity } from "./entities/block.entity";
import { CreateBlockDto } from "./dto/create-block.dto";

export class BlocksService {
  constructor(
    @InjectRepository(BlockEntity)
    private blockRepository: Repository<BlockEntity>
  ) {}

  async create(block: BlockEntity): Promise<BlockEntity> {
    return this.blockRepository.save(block);
  }

  async countAll() {
    return this.blockRepository.count();
  }

  findAll(): Promise<BlockEntity[]> {
    return this.blockRepository.find();
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<BlockEntity[]> {
    return this.blockRepository.find({
      where: [
        { createdAt: MoreThan(timestamp) },
        { updatedAt: MoreThan(timestamp) },
      ],
      order: { height: "DESC" },
    });
  }

  findLastBlock(): Promise<BlockEntity> {
    return this.blockRepository
      .createQueryBuilder("block")
      .select()
      .orderBy("block.height", "DESC")
      .limit(1)
      .getOne();
  }

  async findOne(id: string) {
    return this.blockRepository.findOneByOrFail({ id });
  }

  removeAll() {
    return this.blockRepository.delete({});
  }
}
