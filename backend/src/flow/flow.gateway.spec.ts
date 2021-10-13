import { Test, TestingModule } from '@nestjs/testing';
import { FlowGateway } from './flow.gateway';

describe('FlowGateway', () => {
  let service: FlowGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowGateway],
    }).compile();

    service = module.get<FlowGateway>(FlowGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
