import React, { FunctionComponent, useEffect, useState } from "react";
import classes from "./Events.module.scss";
import Card from "../../components/card/Card";
import Label from "../../components/label/Label";
import Value from "../../components/value/Value";
import { NavLink } from "react-router-dom";
import Ellipsis from "../../components/ellipsis/Ellipsis";
import { useFilterData } from "../../hooks/use-filter-data";
import { useFormattedDate } from "../../hooks/use-formatted-date";
import { useSearch } from "../../hooks/use-search";
import CaretIcon from "../../components/caret-icon/CaretIcon";
import EventDetailsTable from "../../components/event-details-table/EventDetailsTable";
import { useTimeoutPolling } from "../../hooks/use-timeout-polling";
import NoResults from "../../components/no-results/NoResults";
import FullScreenLoading from "../../components/fullscreen-loading/FullScreenLoading";
import splitbee from "@splitbee/web";
import { useGetPollingEvents } from "../../hooks/use-api";

interface OwnProps {
  some?: string;
}

type Props = OwnProps;

const Events: FunctionComponent<Props> = (props) => {
  const [openedLog, setOpenedLog] = useState("");
  const { formatDate } = useFormattedDate();
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { data, firstFetch } = useGetPollingEvents();
  const { filteredData } = useFilterData(data, searchTerm);

  useEffect(() => {
    setPlaceholder("Search for block id, type, transaction ...");
    disableSearchBar(!data.length);
  }, [data]);

  const openLog = (status: boolean, id: string) => {
    setOpenedLog(!status ? id : "");
    splitbee.track("Events: toggle details");
  };

  return (
    <>
      {filteredData.map((item, i) => (
        <React.Fragment key={i + "-" + item.blockId}>
          <Card
            className={`${classes.card} ${
              item.isNew || item.isUpdated ? classes.isNew : ""
            }`}
          >
            <div>
              <Label>BLOCK ID</Label>
              <Value>
                <NavLink to={`/blocks/details/${item.blockId}`}>
                  <Ellipsis className={classes.hash}>{item.blockId}</Ellipsis>
                </NavLink>
              </Value>
            </div>
            <div>
              <Label>TIMESTAMP</Label>
              <Value>
                {formatDate(new Date(item.createdAt).toISOString())}
              </Value>
            </div>
            <div>
              <Label>TYPE</Label>
              <Value>{item.type}</Value>
            </div>
            <div>
              <Label>TX ID</Label>
              <Value>
                <NavLink to={`/transactions/details/${item.transactionId}`}>
                  <Ellipsis className={classes.hash}>
                    {item.transactionId}
                  </Ellipsis>
                </NavLink>
              </Value>
            </div>
            <div>
              <Label title="TRANSACTION INDEX">TX INDEX</Label>
              <Value>{item.transactionIndex}</Value>
            </div>
            <div>
              <Label>EVENT INDEX</Label>
              <Value>{item.eventIndex}</Value>
            </div>
            <div>
              <CaretIcon
                inverted={true}
                isOpen={openedLog === item.id}
                className={classes.control}
                onChange={(status) => openLog(status, item.id)}
              />
            </div>
          </Card>
          {openedLog === item.id && item.data && (
            <EventDetailsTable
              className={classes.detailsTable}
              data={item.data}
            />
          )}
        </React.Fragment>
      ))}
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
    </>
  );
};

export default Events;
