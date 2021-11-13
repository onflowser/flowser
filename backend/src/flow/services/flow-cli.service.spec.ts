import { Test, TestingModule } from "@nestjs/testing";
import { FlowCliOutput, FlowCliService } from "./flow-cli.service";

const versionRegex = /v[0-9]+\.[0-9]+\.[0-9]+/;

describe('FlowCliService test', () => {
  let service: FlowCliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowCliService, FlowCliService],
    }).compile();

    service = module.get<FlowCliService>(FlowCliService);
  });

  it('should correctly parse flow version', function () {
    const out = new FlowCliOutput('Version: v0.28.3\nCommit: ff1f8b186bf26e922ab6abe845849fb9e6e6d729\n');
    expect(out.findValue("version")).toMatch(versionRegex)
  });

  it('should correctly execute "flow version"', async () => {
    const out = await service.execute("flow", ["version"])
    expect(out).toBeInstanceOf(FlowCliOutput);
    expect(out.findValue("version")).toMatch(versionRegex)
  });
})
