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
import NoResults from "../../components/no-results/NoResults";
import FullScreenLoading from "../../components/fullscreen-loading/FullScreenLoading";
import splitbee from "@splitbee/web";
import { useGetPollingEvents } from "../../hooks/use-api";
import { ColumnDef, createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "frontend/src/hooks/use-timeout-polling";
import { Event } from "types/generated/entities/events";
import { info } from "console";

const Events: FunctionComponent = () => {
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

  // EVENTS TABLE (not working yet)
  // const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

  // const columnsEvents = [
  //   columnHelper.accessor("blockId", {
  //     header: () => <Label variant="medium">BLOCK ID</Label>,
  //     cell: (info) => (
  //       <Value>
  //         <NavLink to={`/blocks/details/${info.getValue()}`}>
  //           <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
  //         </NavLink>
  //       </Value>
  //     ),
  //   }),
  //   columnHelper.accessor("createdAt", {
  //     header: () => <Label variant="medium">TIMESTAMP</Label>,
  //     cell: (info) => (
  //       <Value>{formatDate(new Date(info.getValue()).toISOString())}</Value>
  //     ),
  //   }),
  //   columnHelper.accessor("type", {
  //     header: () => <Label variant="medium">TYPE</Label>,
  //     cell: (info) => <Value>{info.getValue()}</Value>,
  //   }),
  //   columnHelper.accessor("transactionId", {
  //     header: () => <Label variant="medium">TX ID</Label>,
  //     cell: (info) => (
  //       <Value>
  //         <NavLink to={`/transactions/details/${info.getValue()}`}>
  //           <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
  //         </NavLink>
  //       </Value>
  //     ),
  //   }),
  //   columnHelper.accessor("transactionIndex", {
  //     header: () => <Label variant="medium">TX INDEX</Label>,
  //     cell: (info) => <Value>{info.getValue()}</Value>,
  //   }),
  //   columnHelper.accessor("eventIndex", {
  //     header: () => <Label variant="medium">EVENT INDEX</Label>,
  //     cell: ({ row, getValue }) => (
  //       <div>
  //         <Value>{getValue()}</Value>
  //         <CaretIcon
  //               inverted={true}

  //               className={classes.control}
  //               {...{
  //               onClick: row.getToggleExpandedHandler(),
  //               style: { cursor: 'pointer' },
  //               }}
  //             />
  //       </div>
  //     ),
  //   }),
  // ];

  console.log(filteredData);

  return (
    <>
      {filteredData.map((item) => (
        <React.Fragment key={item.blockId}>
          <Card
            className={classes.card}
            showIntroAnimation={item.isNew || item.isUpdated}
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
