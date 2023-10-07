import { FlowGatewayConfig } from "./flow/flow-gateway.service";
import { FlowEmulatorConfig } from './flow/flow-emulator.service';

export class FlowserWorkspace {
  id: string;
  name: string;
  filesystemPath: string;
  gateway: FlowGatewayConfig;
  emulator: FlowEmulatorConfig;
}
