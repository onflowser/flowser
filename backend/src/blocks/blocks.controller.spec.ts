import { Test, TestingModule } from '@nestjs/testing';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

describe('BlocksController', () => {
  let controller: BlocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [BlocksService],
    }).compile();

    controller = module.get<BlocksController>(BlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
