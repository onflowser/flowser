import {
  Injectable,
  BadRequestException,
  ValidationPipe,
} from "@nestjs/common";

@Injectable()
export class ParseUnixTimestampPipe extends ValidationPipe {
  constructor() {
    super();
  }

  async transform(unixTimestamp: string): Promise<Date> {
    const numericUnixTimestamp = parseInt(unixTimestamp);
    if (isNaN(numericUnixTimestamp)) {
      throw new BadRequestException("Unix timestamp not a number");
    }
    return new Date(numericUnixTimestamp);
  }
}
