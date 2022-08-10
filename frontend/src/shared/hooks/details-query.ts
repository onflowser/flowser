import { useQuery } from "react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { PollingEntity } from "@flowser/types/shared/polling";
import { DecoratedPollingEntity } from "./timeout-polling";
import axios from "../config/axios";

export type DetailsEntity<T extends PollingEntity> =
  | { [p: string]: DecoratedPollingEntity<PollingEntity>[] }
  | { [p: string]: T[keyof T] };

export function useDetailsQuery<T extends PollingEntity>(
  resourceKey: string,
  fetcher?: (resourceId: string) => Promise<AxiosResponse<T>>
) {
  const [pollingTime, setPollingTime] = useState(0);
  const [data, setData] = useState<DetailsEntity<T>>();

  const fetchCallback = useCallback(() => {
    return fetcher ? fetcher(resourceKey) : axios.get(resourceKey);
  }, [resourceKey]);

  const query = useQuery<AxiosResponse<T>>(resourceKey, fetchCallback, {
    onSuccess(response) {
      let latestTimestamp = 0;

      const checkTimestampAndIsLaterThanPollingTime = (date: string) => {
        const time = new Date(date).getTime();
        if (time > latestTimestamp) {
          latestTimestamp = time;
        }
        return time >= pollingTime;
      };

      const mapDataArray = (
        data: PollingEntity[]
      ): DecoratedPollingEntity<PollingEntity>[] =>
        data.map((item) => {
          let isNew = false;
          let isUpdated = false;

          if (checkTimestampAndIsLaterThanPollingTime(item.createdAt)) {
            isNew = true;
          }

          if (checkTimestampAndIsLaterThanPollingTime(item.updatedAt)) {
            isUpdated = true;
          }

          return { ...item, isNew, isUpdated };
        });

      const formattedData = (
        Object.keys(response.data) as unknown as (keyof T)[]
      )
        .map((key) => {
          const propertyValue = response.data[key];
          const isPollingEntity =
            propertyValue instanceof Array &&
            propertyValue[0]["createdAt"] &&
            propertyValue[0]["updatedAt"];

          if (isPollingEntity) {
            return {
              [key]: mapDataArray(
                response.data[key] as unknown as PollingEntity[]
              ),
            };
          } else {
            return { [key]: response.data[key] };
          }
        })
        .reduce((builder, item) => Object.assign(builder, item), {});

      setData(formattedData);

      if (latestTimestamp > 0) {
        setPollingTime(latestTimestamp);
      }
    },
    refetchInterval: 1000,
    refetchOnWindowFocus: "always",
  });

  return { ...query, data };
}
