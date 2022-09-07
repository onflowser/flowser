import React, { FunctionComponent, useEffect, useState, useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import DetailsCard from "../../../components/details-card/DetailsCard";
import classes from "./Details.module.scss";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import Card from "../../../components/card/Card";
import TimeAgo from "../../../components/time-ago/TimeAgo";
import DateWithCalendar from "../../../components/date-with-calendar/DateWithCalendar";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import TransactionStatusBadge from "../../../components/status/TransactionStatusBadge";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import CaretIcon from "../../../components/caret-icon/CaretIcon";
import { useFormattedDate } from "../../../hooks/use-formatted-date";
import {
  useGetPollingEventsByTransaction,
  useGetTransaction,
} from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import { SignableObject } from "@flowser/shared";
import Table from "../../../components/table/Table";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import { Event } from "@flowser/shared";
import { ComputedEventData, EventUtils } from "../../../utils/event-utils";
import CopyButton from "../../../components/copy-button/CopyButton";
import { flexRender } from "@tanstack/react-table";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import ReactTimeAgo from "react-timeago";

type RouteParams = {
  transactionId: string;
};

// EVENTS SUBTABLE
const columnHelperEvents = createColumnHelper<ComputedEventData>();
const columnsEvents = [
  columnHelperEvents.display({
    id: "tableTitle",
    header: () => <Label variant="medium">VALUES</Label>,
  }),
  columnHelperEvents.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.ellipsis}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  columnHelperEvents.accessor("type", {
    header: () => <Label variant="medium">TYPE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.ellipsis}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  columnHelperEvents.accessor("value", {
    header: () => <Label variant="medium">VALUE</Label>,
    cell: (info) => (
      <div>
        <Ellipsis style={{ whiteSpace: "nowrap" }} className={classes.subtable}>
          {info.getValue()}
        </Ellipsis>
        <CopyButton value={info.getValue()} />
      </div>
    ),
  }),
];

// ENVELOPE SIGNATURES TABLE
const columnsHelperEnvelope = createColumnHelper<SignableObject>();

const columnsEnvelope = [
  columnsHelperEnvelope.accessor("address", {
    header: () => <Label variant="medium">ACCOUNT ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
  columnsHelperEnvelope.accessor("signature", {
    header: () => <Label variant="medium">SIGNATURE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  columnsHelperEnvelope.accessor("keyId", {
    header: () => <Label variant="medium">KEY ID</Label>,
    cell: (info) => <Value>{info.getValue()}</Value>,
  }),
];

// PAYLOAD SIGNATURES TABLE
const columnsHelperPayload = createColumnHelper<SignableObject>();

const columnsPayload = [
  columnsHelperPayload.accessor("address", {
    header: () => <Label variant="medium">ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
  columnsHelperPayload.accessor("signature", {
    header: () => <Label variant="medium">SIGNATURE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  columnsHelperPayload.accessor("keyId", {
    header: () => <Label variant="medium">KEY ID</Label>,
    cell: (info) => <Value>{info.getValue()}</Value>,
  }),
];

const Details: FunctionComponent = () => {
  const [openedLog, setOpenedLog] = useState("");
  const { transactionId } = useParams<RouteParams>();
  const { setBreadcrumbs, showSearchBar } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const { data, isLoading } = useGetTransaction(transactionId);
  const { data: events } = useGetPollingEventsByTransaction(transactionId);
  const { transaction } = data ?? {};
  const { formatDate } = useFormattedDate();
  const openLog = (status: boolean, id: string) => {
    setOpenedLog(!status ? id : "");
  };
  const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

  // EVENTS TABLE
  const columnsEventsParent = useMemo(
    () => [
      columnHelper.accessor("blockId", {
        header: () => <Label variant="medium">BLOCK ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/blocks/details/${info.getValue()}`}>
              <Ellipsis className={classes.hashEvents}>
                {info.getValue()}
              </Ellipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: () => <Label variant="medium">TIMESTAMP</Label>,
        cell: (info) => (
          <Value>{formatDate(new Date(info.getValue()).toISOString())}</Value>
        ),
      }),
      columnHelper.accessor("type", {
        header: () => <Label variant="medium">TYPE</Label>,
        cell: (info) => (
          <Value>
            <pre style={{ whiteSpace: "nowrap" }}>{info.getValue()}</pre>
          </Value>
        ),
      }),
      columnHelper.accessor("transactionId", {
        header: () => <Label variant="medium">TX ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/transactions/details/${info.getValue()}`}>
              <Ellipsis className={classes.hashEvents}>
                {info.getValue()}
              </Ellipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("transactionIndex", {
        header: () => <Label variant="medium">TX INDEX</Label>,
        cell: (info) => <Value>{info.getValue()}</Value>,
      }),
      columnHelper.accessor("eventIndex", {
        header: () => <Label variant="medium">EVENT INDEX</Label>,
        cell: ({ row, getValue }) => (
          <div className={classes.caretIcon}>
            <Value>{getValue()}</Value>
            <CaretIcon
              inverted={true}
              className={classes.icon}
              isOpen={openedLog === row.id}
              onChange={(status) => openLog(status, row.id)}
            />
          </div>
        ),
      }),
    ],
    [openedLog]
  );

  const breadcrumbs: Breadcrumb[] = [
    { to: "/transactions", label: "Transactions" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
    showSearchBar(false);
  }, []);

  if (isLoading || !transaction) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <Card className={classes.bigCard}>
        <div className={classes.bigCardContent}>
          <div className={classes.bigCardColumn}>
            <div>
              <Label variant="medium" className={classes.label}>
                Transaction
              </Label>
              <Value variant="small" className={classes.value}>
                <Ellipsis className={classes.elipsis}>
                  {transaction.id}
                </Ellipsis>
              </Value>
              <TransactionStatusBadge status={transaction.status} />
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Block ID
              </Label>
              <Value variant="small" className={classes.value}>
                <NavLink to={`/blocks/details/${transaction.blockId}`}>
                  <Ellipsis className={classes.elipsis}>
                    {transaction.blockId}
                  </Ellipsis>
                </NavLink>
              </Value>
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Time Stamp
              </Label>
              <Value variant="small" className={classes.value}>
                {formatDate(transaction.createdAt)}
              </Value>
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Time
              </Label>
              <Value variant="small" className={classes.value}>
                <ReactTimeAgo date={transaction.createdAt} />
              </Value>
            </div>
          </div>
          <div className={classes.bigCardColumn}>
            <div>
              <Label variant="medium" className={classes.label}>
                Proposer
              </Label>
              <Value variant="small" className={classes.value}>
                <NavLink
                  to={
                    transaction.proposalKey
                      ? `/accounts/details/${transaction.proposalKey.address}`
                      : "#"
                  }
                >
                  {transaction.proposalKey?.address ?? "-"}
                </NavLink>
              </Value>
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Payer
              </Label>
              <Value variant="small" className={classes.value}>
                <NavLink to={`/accounts/details/${transaction.payer}`}>
                  {transaction.payer}
                </NavLink>
              </Value>
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Authorizers
              </Label>
              <Value variant="small" className={classes.value}>
                {transaction.authorizers.map((address: string) => (
                  <NavLink
                    key={address}
                    className={classes.authorizersAddress}
                    to={`/accounts/${address}`}
                  >
                    {address}
                  </NavLink>
                ))}
              </Value>
            </div>
            <div>
              <Label variant="medium" className={classes.label}>
                Sequence nb.
              </Label>
              <Value variant="small" className={classes.value}>
                {transaction.proposalKey?.sequenceNumber ?? "-"}
              </Value>
            </div>
          </div>
        </div>
      </Card>
      <DetailsTabs>
        <DetailsTabItem label="SCRIPT" value="<>">
          <ContentDetailsScript
            script={transaction.script}
            args={transaction.args}
          />
        </DetailsTabItem>
        <DetailsTabItem
          label="ENVELOPE SIGNATURES"
          value={transaction.envelopeSignatures.length}
        >
          <Table<SignableObject>
            data={transaction.envelopeSignatures}
            columns={columnsEnvelope}
          />
        </DetailsTabItem>
        <DetailsTabItem
          label="PAYLOAD SIGNATURES"
          value={transaction.payloadSignatures?.length || 0}
        >
          {transaction.payloadSignatures.map((item) => (
            <Card key={item.keyId} className={classes.listCard}>
              <div>
                <Label className={classes.label}>ACCOUNT ADDRESS</Label>
                <Value>
                  <NavLink to={`/accounts/details/${item.address}`}>
                    {item.address}
                  </NavLink>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>SIGNATURE</Label>
                <Value>
                  <Ellipsis className={classes.hash}>{item.signature}</Ellipsis>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>KEY ID</Label>
                <Value>{item.keyId}</Value>
              </div>
              <div></div>
            </Card>
          ))}
          <Table<SignableObject>
            data={transaction.payloadSignatures}
            columns={columnsPayload}
          />
        </DetailsTabItem>
        <DetailsTabItem label="EVENTS" value={events.length}>
          <Table<DecoratedPollingEntity<Event>>
            data={events}
            columns={columnsEventsParent}
            renderCustomHeader={(headerGroup) => (
              <Card
                className={`${classes.tableRow}`}
                key={headerGroup.id}
                variant="header-row"
              >
                {headerGroup.headers.map((header) => (
                  <div key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                ))}
              </Card>
            )}
            renderCustomRow={(row) => (
              <>
                <Card
                  className={classes.tableRow}
                  key={row.id}
                  showIntroAnimation={true}
                  variant="table-line"
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </Card>
                {openedLog === row.id && row.original && (
                  <div>
                    <Table<ComputedEventData>
                      data={EventUtils.computeEventData(row.original.data)}
                      columns={columnsEvents}
                    />
                  </div>
                )}
              </>
            )}
          />
        </DetailsTabItem>
        <DetailsTabItem label="GAS LIMIT" value={transaction?.gasLimit} />
      </DetailsTabs>
    </div>
  );
};

export default Details;
