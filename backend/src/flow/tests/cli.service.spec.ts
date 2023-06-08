import { FlowCliService } from "../services/cli.service";
import { FlowConfigService } from "../services/config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ProjectEntity } from "../../projects/entities/project.entity";

describe("FlowCliService", function () {
  let cliService: FlowCliService;

  beforeAll(async () => {
    const configService = new FlowConfigMockService();
    const processManagerService = new ProcessManagerService();
    cliService = new FlowCliService(configService, processManagerService);

    const mockProject = new ProjectEntity();
    await cliService.onEnterProjectContext(mockProject);
  });

  it("should return the generated key", async function () {
    const generatedKey = await cliService.generateKey();

    expect(generatedKey.private).toBeDefined();
    expect(generatedKey.public).toBeDefined();
    expect(generatedKey.derivationPath).toBeDefined();
    expect(generatedKey.mnemonic).toBeDefined();
  });

  // TODO(custom-wallet): This test will fail, since it requires a running flow emulator
  // it("should return the generated key", async function () {
  //   const generatedKey = await cliService.generateKey();
  //   const createdAccount = await cliService.createAccount([generatedKey]);
  //
  //   expect(createdAccount.address).toBeDefined();
  //   expect(createdAccount.balance).toBeDefined();
  //   expect(createdAccount.contracts).toHaveLength(0);
  //   expect(createdAccount.keys).toHaveLength(1);
  //   expect(createdAccount.keys[0]).toEqual(generatedKey.public);
  // });
});

class FlowConfigMockService extends FlowConfigService {
  hasConfigFile(): boolean {
    // This is to skip the flow cli initialization in tests.
    return true;
  }
}
