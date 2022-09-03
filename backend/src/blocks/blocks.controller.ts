import { Body, Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import {
  GetAllBlocksResponse,
  GetPollingBlocksRequest,
  GetPollingBlocksResponse,
  GetSingleBlockResponse,
} from "@flowser/shared";

@Controller("blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  async findAll() {
    const blocks = await this.blocksService.findAll();
    return GetAllBlocksResponse.fromPartial({
      blocks: blocks.map((block) => block.toProto()),
    });
  }

  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingBlocksResponse))
  async findAllNew(@Body() data) {
    const request = GetPollingBlocksRequest.fromJSON(data);
    const blocks = await this.blocksService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return blocks.map((block) => block.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const block = await this.blocksService.findOne(id);
    return GetSingleBlockResponse.fromPartial({
      block: block.toProto(),
    });
  }
}
