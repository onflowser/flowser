import { Module } from "@nestjs/common";
import { LogsService } from "./logs.service";
import { LogsController } from "./logs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogEntity } from "./entities/log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
