import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";
import {
  GetAllBlocksResponse,
  GetPollingBlocksResponse,
  GetSingleBlockResponse,
} from "@flowser/types/generated/responses/blocks";

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
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const blocks = await this.blocksService.findAllNewerThanTimestamp(
      timestamp
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
