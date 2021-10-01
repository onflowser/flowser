import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [
    EventsService
  ]
})
export class EventsModule {}
