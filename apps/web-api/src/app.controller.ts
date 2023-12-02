import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { GoBindingsService } from '@onflowser/nodejs';

@Controller()
export class AppController {
  constructor(private readonly goBindingsService: GoBindingsService) {}

  @Get('address/:address/index')
  getIndexOfAddress(
    @Param('address') address: string,
    @Query('chainId') chainId: string,
  ) {
    if (chainId === undefined) {
      throw new BadRequestException(
        'Query parameter `chainId` must be provided',
      );
    }
    return this.goBindingsService.getIndexOfAddress({
      hexAddress: address,
      chainId,
    });
  }
}
