import { Injectable } from "@nestjs/common";
import { CreateLogDto } from "./dto/create-log.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { LogEntity } from "./entities/log.entity";
import { MoreThan, Repository } from "typeorm";

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntity)
    private logsRepository: Repository<LogEntity>
  ) {}

  create(createLogDto: CreateLogDto) {
    return this.logsRepository.insert(createLogDto);
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<LogEntity[]> {
    return this.logsRepository.find({
      where: { createdAt: MoreThan(timestamp) },
    });
  }

  async countAll() {
    return this.logsRepository.count();
  }

  findAll() {
    return this.logsRepository.find({});
  }

  removeAll() {
    return this.logsRepository.delete({});
  }
}
