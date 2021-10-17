import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "./entities/log.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class LogsService {

  constructor (
    @InjectRepository(Log)
    private logsRepository: MongoRepository<Log>) {}

  create(createLogDto: CreateLogDto) {
    return this.logsRepository.insert(createLogDto)
  }

  findAllNewerThanTimestamp(timestamp): Promise<Log[]> {
    return this.logsRepository.find({
      where: {createdAt: {$gt: timestamp}}
    });
  }

  findAll() {
    return this.logsRepository.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
