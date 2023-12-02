import { Controller, Get, Param, Query } from '@nestjs/common';
import { GoBindingsService } from '@onflowser/nodejs';

@Controller()
export class AppController {
  constructor(private readonly goBindingsService: GoBindingsService) {}

  @Get('chain/:chainId/address/:address/index')
  getIndexOfAddress(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ) {
    return this.goBindingsService.getIndexOfAddress({
      hexAddress: address,
      chainId,
    });
  }

  @Get('interaction/parsed')
  getParsedInteraction(@Query('sourceCode') sourceCode: string) {
    return this.goBindingsService.getParsedInteraction({
      sourceCode,
    });
  }
}
