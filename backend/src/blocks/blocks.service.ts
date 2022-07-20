import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Block } from "./entities/block.entity";
import { CreateBlockDto } from "./dto/create-block.dto";

export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  ) {}

  async create(createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blockRepository.save(createBlockDto);
  }

  findAll(): Promise<Block[]> {
    return this.blockRepository.find();
  }

  findAllNewerThanTimestamp(timestamp): Promise<Block[]> {
    return this.blockRepository.find({
      where: [
        { createdAt: MoreThan(timestamp) },
        { updatedAt: MoreThan(timestamp) },
      ],
      order: { height: "DESC" },
    });
  }

  findLastBlock(): Promise<Block> {
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
