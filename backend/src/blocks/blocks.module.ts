import { Module } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { BlocksController } from "./blocks.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockEntity } from "./entities/block.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BlockEntity])],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
