import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class EventsService {

  constructor (
    @InjectRepository(Event)
    private eventRepository: MongoRepository<Event>
  ) {}

  create(createEventDto: CreateEventDto) {
    return this.eventRepository.save(createEventDto);
  }

  findAll() {
    return this.eventRepository.find();
  }

  findAllNewerThanTimestamp(timestamp): Promise<Event[]> {
    return this.eventRepository.find({
      where: {createdAt: {$gt: timestamp}}
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
