import { Test, TestingModule } from '@nestjs/testing';
import { FlowGatewayService } from './flow-gateway.service';

describe('FlowGatewayService', () => {
  let service: FlowGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowGatewayService],
    }).compile();

    service = module.get<FlowGatewayService>(FlowGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
