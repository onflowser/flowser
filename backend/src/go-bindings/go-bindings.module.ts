import { Module } from "@nestjs/common";
import { GoBindingsService } from "@onflowser/core/src/flow/go-bindings.service";
import { GoBindingsController } from "./go-bindings.controller";

@Module({
  providers: [GoBindingsService],
  controllers: [GoBindingsController],
  exports: [GoBindingsService],
})
export class GoBindingsModule {}
