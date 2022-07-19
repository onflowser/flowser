import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PollingResponseMeta {
    latestTimestamp: number;
}

export interface Response<T> {
    data: T;
    meta: PollingResponseMeta;
}

@Injectable()
export class PollingResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const findLatestTimestamp = (data: any[]) => {
            let latestTimestamp = 0;
            if (Array.isArray(data)) {
                const latestTimestampCreated = data.reduce(
                    (latest, item) => (item.createdAt > latest ? item.createdAt : latest),
                    0,
                );
                const latestTimestampUpdated = data.reduce(
                    (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
                    0,
                );
                latestTimestamp =
                    latestTimestampUpdated > latestTimestampCreated ? latestTimestampUpdated : latestTimestampCreated;
            }
            return latestTimestamp;
        };

        return next.handle().pipe(map((data) => ({ data, meta: { latestTimestamp: findLatestTimestamp(data) } })));
    }
}
