import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ProcessManagerService } from "./process-manager.service";
import { ManagedProcess } from "./managed-process";

@Controller("processes")
export class ProcessManagerController {
  constructor(private processManagerService: ProcessManagerService) {}

  @Get()
  async getAllProcesses() {
    return this.processManagerService.getAll();
  }

  @Post()
  async runProcess(@Body() body) {
    const managedProcess = new ManagedProcess({
      command: {
        name: body.name,
        args: body.args,
      },
    });
    console.log(await managedProcess.commandExists());
    await this.processManagerService.run(managedProcess);
  }

  @Delete(":id")
  async stopProcess(@Param("id") id) {
    return this.processManagerService.stop(id);
  }
}
