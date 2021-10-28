import { Test, TestingModule } from '@nestjs/testing';
import { FlowEmulatorService } from './flow-emulator.service';
import { FlowCliConfigService } from "./flow-cli-config.service";

describe('FlowEmulatorService', () => {
    let service: FlowEmulatorService;

    const rawLogLines = [
        "time=\"2021-10-28T19:20:51Z\" level=debug msg=\"\u001b[1;32mEVT\u001b[0m \u001b[2m[494f0f]\u001b[0m flow.AccountKeyAdded: 0x6d2b48f5d728375405794132bd15244bf1caaf3654cabae8274a76ffa5ab7ef7\"",
        "time=\"2021-10-28T19:20:51Z\" level=debug msg=\"📦  Block #1 committed\" blockHeight=1 blockID=bba57391da4b1536172e2509238ed9ad97cbd2c1a2649196b09fad6b2c116f0b",
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FlowEmulatorService, FlowCliConfigService],
        }).compile();

        service = module.get<FlowEmulatorService>(FlowEmulatorService);
    });

    it('should parse log lines', function () {
        const parsedLines = rawLogLines.map(line => FlowEmulatorService.parseLogLine(line));
        expect(parsedLines).toEqual([
            {
                level: "debug",
                time: "2021-10-28T19:20:51Z",
                msg: "\u001b[1;32mEVT\u001b[0m \u001b[2m[494f0f]\u001b[0m flow.AccountKeyAdded: 0x6d2b48f5d728375405794132bd15244bf1caaf3654cabae8274a76ffa5ab7ef7"
            },
            {
                level: "debug",
                time: "2021-10-28T19:20:51Z",
                msg: "📦  Block #1 committed",
                blockHeight: "1",
                blockID: "bba57391da4b1536172e2509238ed9ad97cbd2c1a2649196b09fad6b2c116f0b"
            }
        ])
    });

    it('should format log lines', function () {
        const formattedLines = FlowEmulatorService.formatLogLines(rawLogLines);
        expect(formattedLines).toEqual([
            `DEBU[Thu Oct 28 2021 21:20:51] \u001b[1;32mEVT\u001b[0m \u001b[2m[494f0f]\u001b[0m flow.AccountKeyAdded: 0x6d2b48f5d728375405794132bd15244bf1caaf3654cabae8274a76ffa5ab7ef7`,
            `DEBU[Thu Oct 28 2021 21:20:51] 📦  Block #1 committed blockHeight="1" blockID="bba57391da4b1536172e2509238ed9ad97cbd2c1a2649196b09fad6b2c116f0b"`
        ])
    });
});
