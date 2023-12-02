import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GoBindingsService } from '@onflowser/nodejs';
import * as path from 'path';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    {
      provide: GoBindingsService,
      useValue: new GoBindingsService({
        binDirPath: path.join(
          __dirname,
          '../../../',
          'packages',
          'nodejs',
          'bin',
        ),
      }),
    },
  ],
})
export class AppModule {}
