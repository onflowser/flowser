import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';

@Module({
  controllers: [BlocksController],
  providers: [BlocksService]
})
export class BlocksModule {}
