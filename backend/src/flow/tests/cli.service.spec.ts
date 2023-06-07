import { FlowCliService } from "../services/cli.service";
import { FlowConfigService } from "../services/config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ProjectEntity } from "../../projects/entities/project.entity";

describe("CliService", function () {
  it("should return the generated key", async function () {
    const configService = new FlowConfigMockService();
    const processManagerService = new ProcessManagerService();
    const cliService = new FlowCliService(configService, processManagerService);

    const mockProject = new ProjectEntity();
    await cliService.onEnterProjectContext(mockProject);

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
