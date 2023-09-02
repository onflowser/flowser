import React, { FunctionComponent } from "react";
import { useGetPollingEvents } from "../../hooks/use-api";
import { EventsTable } from "./EventsTable/EventsTable";

export const EventsRouter: FunctionComponent = () => {
  const { data } = useGetPollingEvents();

  return <EventsTable events={data} />;
};
