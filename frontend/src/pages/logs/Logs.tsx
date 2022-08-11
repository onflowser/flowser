import React, {
  createRef,
  FunctionComponent,
  useCallback,
  useEffect,
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
import { useGetPollingLogs } from "../../hooks/use-api";

interface OwnProps {
  className?: string;
}

type Props = OwnProps;
const SEARCH_CONTEXT_NAME = "logs";

const Logs: FunctionComponent<Props> = ({ className }) => {
  const [trackMousePosition, setTrackMousePosition] = useState(false);
  const { logDrawerSize, setSize } = useLogDrawer();
  const { highlightLogKeywords } = useSyntaxHighlighter();
  const miniLogRef = createRef<HTMLDivElement>();
  const bigLogRef = createRef<HTMLDivElement>();
  const { data } = useGetPollingLogs();
  const logs = data ? data.map((log) => log.data) : [];
  const { searchTerm, setPlaceholder } = useSearch(SEARCH_CONTEXT_NAME);
  const { filteredData } = useFilterData(logs, searchTerm);
  const mouseEvent = useMouseMove(trackMousePosition);

  const scrollToBottom = (
    ref: React.RefObject<HTMLDivElement>,
    smooth = true
  ) => {
    if (ref.current) {
      const options: ScrollToOptions = {
        top: ref.current.scrollHeight,
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      };
      ref.current.scrollTo(options);
    }
  };

  useEffect(() => {
    setPlaceholder("search logs");
  }, []);

  useEffect(() => {
    scrollToBottom(miniLogRef);
    scrollToBottom(bigLogRef);
  }, [data]);

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
      scrollToBottom(bigLogRef, false);
      scrollToBottom(miniLogRef, false);
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
          <div className={classes.midContainer} ref={miniLogRef}>
            {filteredData.map((log: any, key: number) => (
              <pre
                key={key}
                dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}
              ></pre>
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
        <div className={classes.bigLogsContainer} ref={bigLogRef}>
          {filteredData.map((log: any, key: number) => (
            <pre
              className={classes.line}
              key={key}
              dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
