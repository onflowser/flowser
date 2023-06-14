import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository, Any } from "typeorm";
import { BlockEntity } from "./entities/block.entity";
import { removeByBlockIds } from "./entities/block-context.entity";

export class BlocksService {
  constructor(
    @InjectRepository(BlockEntity)
    private blockRepository: Repository<BlockEntity>
  ) {}

  async create(block: BlockEntity): Promise<BlockEntity> {
    return this.blockRepository.save(block);
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
      order: { blockHeight: "DESC" },
    });
  }

  findLastBlock(): Promise<BlockEntity | null> {
    return this.blockRepository
      .createQueryBuilder("block")
      .select()
      .orderBy("block.blockHeight", "DESC")
      .limit(1)
      .getOne();
  }

  async findOne(blockId: string) {
    return this.blockRepository.findOneByOrFail({ blockId });
  }

  removeAll() {
    return this.blockRepository.delete({});
  }

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.blockRepository,
    });
  }
}
