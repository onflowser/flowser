import React, { FunctionComponent, useEffect } from "react";
import { useGetPollingEvents } from "../../hooks/use-api";
import { useNavigation } from "../../hooks/use-navigation";
import { EventsTable } from "./EventsTable";

const Events: FunctionComponent = () => {
  const { showNavigationDrawer } = useNavigation();
  const { data, firstFetch, error } = useGetPollingEvents();

  useEffect(() => {
    showNavigationDrawer(false);
  }, []);

  return <EventsTable events={data} />;
};

export default Events;
