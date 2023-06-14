import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEntity } from "./event.entity";
import { MoreThan, Repository, Any } from "typeorm";
import { removeByBlockIds } from '../blocks/entities/block-context.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>
  ) {}

  create(event: EventEntity) {
    return this.eventRepository.save(event);
  }

  findAll() {
    return this.eventRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  findAllNewerThanTimestamp(timestamp): Promise<EventEntity[]> {
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

  removeAll() {
    return this.eventRepository.delete({});
  }

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.eventRepository
    })
  }
}
