import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PollingResponse, PollingEntity } from "@flowser/shared";

interface ProtoSerializer<T extends PollingEntity[]> {
  toJSON: (message: any) => unknown;
  fromPartial: (message: any) => PollingResponse<T>;
}

@Injectable()
export class PollingResponseInterceptor<T extends PollingEntity[], P>
  implements NestInterceptor<T, unknown>
{
  constructor(private readonly serializer: ProtoSerializer<T>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data): unknown =>
        this.serializer.toJSON(
          this.serializer.fromPartial({
            data,
            meta: {
              latestTimestamp: findLatestTimestamp(data),
            },
          })
        )
      )
    );
  }
}

function findLatestTimestamp<T extends PollingEntity[]>(data: T) {
  let latestTimestamp = 0;
  if (Array.isArray(data)) {
    const latestTimestampCreated = data.reduce(
      (latest, item) =>
        getUnixTime(item.createdAt) > latest
          ? getUnixTime(item.createdAt)
          : latest,
      0
    );
    const latestTimestampUpdated = data.reduce(
      (latest, item) =>
        getUnixTime(item.updatedAt) > latest
          ? getUnixTime(item.updatedAt)
          : latest,
      0
    );
    latestTimestamp =
      latestTimestampUpdated > latestTimestampCreated
        ? latestTimestampUpdated
        : latestTimestampCreated;
  }
  return latestTimestamp;
}

function getUnixTime(date: string): number {
  return new Date(date).getTime();
}
