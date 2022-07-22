import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PollingEntity } from "../entities/polling.entity";

export interface PollingResponseMeta {
  latestTimestamp: number;
}

export interface Response<T> {
  data: T;
  meta: PollingResponseMeta;
}

@Injectable()
export class PollingResponseInterceptor<T extends PollingEntity[]>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: { latestTimestamp: findLatestTimestamp(data) },
      }))
    );
  }
}

function findLatestTimestamp<T extends PollingEntity[]>(data: T) {
  let latestTimestamp = 0;
  if (Array.isArray(data)) {
    const latestTimestampCreated = data.reduce(
      (latest, item) =>
        item.createdAt.getTime() > latest ? item.createdAt.getTime() : latest,
      0
    );
    const latestTimestampUpdated = data.reduce(
      (latest, item) =>
        item.updatedAt.getTime() > latest ? item.updatedAt.getTime() : latest,
      0
    );
    latestTimestamp =
      latestTimestampUpdated > latestTimestampCreated
        ? latestTimestampUpdated
        : latestTimestampCreated;
  }
  return latestTimestamp;
}
