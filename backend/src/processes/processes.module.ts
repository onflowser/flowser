import { Module } from "@nestjs/common";
import { ProcessManagerService } from "./process-manager.service";
import { ProcessManagerController } from "./process-manager.controller";

@Module({
  exports: [ProcessManagerService],
  providers: [ProcessManagerService],
  controllers: [ProcessManagerController],
})
export class ProcessesModule {}
