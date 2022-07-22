import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { MoreThan, Repository } from "typeorm";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>
  ) {}

  create(createEventDto: CreateEventDto) {
    return this.eventRepository.save(createEventDto);
  }

  async countAll() {
    return this.eventRepository.count();
  }

  findAll() {
    return this.eventRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  findAllNewerThanTimestamp(timestamp): Promise<Event[]> {
    return this.eventRepository.find({
      where: [
        { createdAt: MoreThan(timestamp) },
        { updatedAt: MoreThan(timestamp) },
      ],
      order: { createdAt: "DESC" },
    });
  }

  findAllByTransaction(transactionId: string) {
    return this.eventRepository.find({
      where: { transactionId },
      order: { createdAt: "DESC" },
    });
  }

  findAllByTransactionNewerThanTimestamp(transactionId: string, timestamp) {
    return this.eventRepository.find({
      where: {
        createdAt: MoreThan(timestamp),
        transactionId,
      },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const [event] = await this.eventRepository.find({ where: { id } });
    if (event) {
      return event;
    } else {
      throw new NotFoundException("Event not found");
    }
  }

  removeAll() {
    return this.eventRepository.delete({});
  }
}
