import React, {
  createRef,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classes from "./Logs.module.scss";
import Search from "../../components/search/Search";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";
import { ReactComponent as ShrinkIcon } from "../../assets/icons/shrink.svg";
import { ReactComponent as LogsIcon } from "../../assets/icons/logs.svg";
import { LogDrawerSize, useLogDrawer } from "../../hooks/use-log-drawer";
import CaretIcon from "../../components/caret-icon/CaretIcon";
import { useSyntaxHighlighter } from "../../hooks/use-syntax-highlighter";
import { useSearch } from "../../hooks/use-search";
import { useFilterData } from "../../hooks/use-filter-data";
import splitbee from "@splitbee/web";
import { useMouseMove } from "../../hooks/use-mouse-move";
import { useGetCurrentProject, useGetPollingLogs } from "../../hooks/use-api";
import { ManagedProcessLog, LogSource } from "@flowser/shared";
import { toast } from "react-hot-toast";

type LogsProps = {
  className?: string;
};

const SEARCH_CONTEXT_NAME = "logs";

const Logs: FunctionComponent<LogsProps> = ({ className }) => {
  const [trackMousePosition, setTrackMousePosition] = useState(false);
  const { logDrawerSize, setSize } = useLogDrawer();
  const tinyLogRef = createRef<HTMLDivElement>();
  const nonTinyLogRef = createRef<HTMLDivElement>();
  const { data: logs } = useGetPollingLogs();
  // TODO(milestone-x): why are logs not sorted correctly in useGetPollingLogs hooK?
  const sortedLogs = useMemo(() => logs.sort((a, b) => a.id - b.id), [logs]);
  const { searchTerm, setPlaceholder } = useSearch(SEARCH_CONTEXT_NAME);
  const { data } = useGetCurrentProject();
  const isCapturingEmulatorLogs = data?.project?.emulator?.run;
  const { filteredData } = useFilterData(sortedLogs, searchTerm);
  const mouseEvent = useMouseMove(trackMousePosition);

  const scrollToBottom = (smooth = true) => {
    const ref = logDrawerSize === "tiny" ? tinyLogRef : nonTinyLogRef;
    if (ref.current) {
      const options: ScrollToOptions = {
        top: ref.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      };
      ref.current.scrollTo(options);
    }
  };

  useEffect(() => {
    setPlaceholder("search logs");
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logDrawerSize]);

  useEffect(() => {
    // TODO(ui): scroll to bottom only when drawer is not "in use"
    const hasStdErrLogs = logs.some(
      (log) => log.source === LogSource.LOG_SOURCE_STDERR
    );
    if (hasStdErrLogs) {
      // TODO(milestone-5): Uncomment below line
      // setSize("small"); -- this is temporary
      toast.error("Flow emulator encountered errors", {
        duration: 4000,
      });
    }

    scrollToBottom();
  }, [logs]);

  const onCaretChange = useCallback((state) => {
    if (state === false) {
      changeLogDrawerSize("small");
      splitbee.track(`Logs: size small`);
    } else {
      changeLogDrawerSize("tiny");
      splitbee.track(`Logs: size tiny`);
    }
  }, []);

  const changeLogDrawerSize = useCallback((size: LogDrawerSize) => {
    setSize(size);
    splitbee.track(`Logs: size ${size}`);
    setTimeout(() => {
      scrollToBottom(false);
    }, 100);
  }, []);

  useEffect(() => {
    // ignore collapse if user moves drawer upwards
    if (!mouseEvent || mouseEvent.movementY <= 0) return;
    const bottomPosition = window.innerHeight - mouseEvent.clientY;
    // collapse if user drags drawer downwards and reaches a certain threshold
    if (bottomPosition <= 130) {
      setSize("tiny");
      setTrackMousePosition(false);
    }
  }, [mouseEvent]);

  const startPositionDrag = useCallback(() => {
    setTrackMousePosition(true);
    setSize("custom");
  }, []);

  const endPositionDrag = useCallback(() => {
    setTrackMousePosition(false);
  }, []);

  if (!isCapturingEmulatorLogs) {
    // TODO(milestone-5): Should we show some kind of notice somewhere?
    return null;
  }

  return (
    <div
      className={`${classes.root} ${className}`}
      style={logDrawerSize === "custom" ? { top: mouseEvent?.clientY } : {}}
    >
      <VerticalDragLine
        isActive={trackMousePosition}
        startPositionDrag={startPositionDrag}
        endPositionDrag={endPositionDrag}
      />

      <div
        className={`${classes.header} ${
          logDrawerSize !== "tiny" ? classes.expanded : ""
        }`}
      >
        <span className={classes.leftContainer}>
          <LogsIcon />
          <span>LOGS</span>
        </span>

        {logDrawerSize === "tiny" && (
          <div className={classes.midContainer} ref={tinyLogRef}>
            {filteredData.map((log) => (
              <LogLine key={log.id} log={log} />
            ))}
          </div>
        )}

        <div className={classes.rightContainer}>
          {logDrawerSize !== "tiny" && (
            <Search
              context={SEARCH_CONTEXT_NAME}
              className={classes.searchBox}
            />
          )}
          <div>
            {["tiny", "small", "custom"].includes(logDrawerSize) && (
              <CaretIcon
                inverted={true}
                isOpen={logDrawerSize !== "tiny"}
                className={classes.control}
                onChange={onCaretChange}
              />
            )}
            {logDrawerSize === "small" && (
              <ExpandIcon
                className={classes.control}
                onClick={() => changeLogDrawerSize("big")}
              />
            )}
            {logDrawerSize === "big" && (
              <ShrinkIcon
                className={classes.control}
                onClick={() => changeLogDrawerSize("small")}
              />
            )}
          </div>
        </div>
      </div>

      {logDrawerSize !== "tiny" && (
        <div className={classes.bigLogsContainer} ref={nonTinyLogRef}>
          {filteredData.map((log) => (
            <LogLine key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
};

function LogLine({ log }: { log: ManagedProcessLog }) {
  const { highlightLogKeywords } = useSyntaxHighlighter();

  return (
    <pre
      className={classes.line}
      style={
        // TODO(ui): use color from color pallet
        log.source === LogSource.LOG_SOURCE_STDERR ? { color: "#D02525" } : {}
      }
      dangerouslySetInnerHTML={{
        __html: highlightLogKeywords(log.data),
      }}
    />
  );
}

type VerticalDragLineProps = {
  startPositionDrag: (e: React.MouseEvent) => void;
  endPositionDrag: (e: React.MouseEvent) => void;
  isActive?: boolean;
};

const VerticalDragLine = ({
  isActive,
  startPositionDrag,
  endPositionDrag,
}: VerticalDragLineProps) => {
  return (
    <div
      style={{
        height: 3,
        cursor: "ns-resize",
        left: 0,
        right: 0,
        top: -1.5,
        position: "absolute",
        background: isActive ? "#FFC016" : "transparent",
      }}
      onMouseDown={startPositionDrag}
      onMouseUp={endPositionDrag}
    />
  );
};

export default Logs;
