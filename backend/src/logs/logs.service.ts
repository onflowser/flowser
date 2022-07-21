import { Injectable } from "@nestjs/common";
import { CreateLogDto } from "./dto/create-log.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "./entities/log.entity";
import { MoreThan, Repository } from "typeorm";

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>
  ) {}

  create(createLogDto: CreateLogDto) {
    return this.logsRepository.insert(createLogDto);
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<Log[]> {
    return this.logsRepository.find({
      where: { createdAt: MoreThan(timestamp) },
    });
  }

  findAll() {
    return this.logsRepository.find({});
  }

  removeAll() {
    return this.logsRepository.delete({});
  }
}
