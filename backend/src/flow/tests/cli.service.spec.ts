import { FlowCliService } from "../../../../packages/core/src/flow/flow-cli.service";
import { FlowConfigService } from "../../../../packages/core/src/flow/flow-config.service";
import { ProcessManagerService } from "../../../../packages/core/src/processes/process-manager.service";
import { ProjectEntity } from "../../projects/project.entity";
import { Emulator, Gateway } from "@flowser/shared";

describe("FlowCliService", function () {
  let cliService: FlowCliService;

  beforeAll(async () => {
    const configService = new FlowConfigMockService();
    const processManagerService = new ProcessManagerService();
    cliService = new FlowCliService(configService, processManagerService);

    const mockProject = new ProjectEntity({
      emulator: Emulator.fromPartial({}),
      filesystemPath: "",
      gateway: Gateway.fromPartial({}),
      id: "",
      name: "",
      startBlockHeight: 0,
    });
    await cliService.start(mockProject);
  });

  it("should return the generated key", async function () {
    const generatedKey = await cliService.generateKey();

    expect(generatedKey.private).toBeDefined();
    expect(generatedKey.public).toBeDefined();
    expect(generatedKey.derivationPath).toBeDefined();
    expect(generatedKey.mnemonic).toBeDefined();
  });
});

class FlowConfigMockService extends FlowConfigService {
  hasConfigFile(): boolean {
    // This is to skip the flow cli initialization in tests.
    return true;
  }
}
