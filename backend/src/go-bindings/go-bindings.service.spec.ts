import { Test, TestingModule } from "@nestjs/testing";
import { GoBindingsService } from "services/src/flow/go-bindings.service";

describe("InteractionsService", () => {
  let service: GoBindingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoBindingsService],
    }).compile();

    service = module.get<GoBindingsService>(GoBindingsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
