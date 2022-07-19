import { Controller, Get } from '@nestjs/common';
import { FlowGatewayService } from './services/flow-gateway.service';
import { FlowEmulatorService } from './services/flow-emulator.service';
import { FlowCliService } from './services/flow-cli.service';

@Controller('flow')
export class FlowController {
    constructor(
        private flowGatewayService: FlowGatewayService,
        private flowEmulatorService: FlowEmulatorService,
        private flowCliService: FlowCliService,
    ) {}

    @Get('gateway')
    async getGateway() {
        const isConnected = await this.flowGatewayService.isConnectedToGateway();
        return {
            isConnected,
        };
    }

    @Get('emulator')
    getEmulator() {
        return {
            status: this.flowEmulatorService.state,
            config: this.flowEmulatorService.configuration,
            process: this.flowEmulatorService.emulatorProcess,
        };
    }

    @Get('emulator/logs')
    async getLogs() {
        return this.flowEmulatorService.logs;
    }

    @Get('version')
    async getVersion() {
        return this.flowCliService.version();
    }
}
