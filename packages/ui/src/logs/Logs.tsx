import React, {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import classes from "./Logs.module.scss";
import { CaretIcon } from "../common/icons/CaretIcon/CaretIcon";
import { useFilterData } from "../hooks/use-filter-data";
import { useMouseMove } from "../hooks/use-mouse-move";
import { toast } from "react-hot-toast";
import classNames from "classnames";
import { SimpleButton } from "../common/buttons/SimpleButton/SimpleButton";
import { Callout } from "../common/misc/Callout/Callout";
import { SearchInput } from "../common/inputs";
import { ManagedProcessOutput, ProcessOutputSource } from "@onflowser/api";
import AnsiHtmlConvert from "ansi-to-html";
import { FlowserIcon } from "../common/icons/FlowserIcon";
import { useGetOutputsByProcess, useGetProcesses } from "../api";
import { BaseDialog } from "../common/overlays/dialogs/base/BaseDialog";
import { ExternalLink } from "../common/links/ExternalLink/ExternalLink";
import { CadenceEditor } from "../common/code/CadenceEditor/CadenceEditor";
import { SizedBox } from "../common/misc/SizedBox/SizedBox";

type LogsProps = {
  className?: string;
};

type LogDrawerSize = "tiny" | "small" | "big" | "custom";

export function Logs(props: LogsProps): ReactElement {
  const [trackMousePosition, setTrackMousePosition] = useState(false);
  const [logDrawerSize, setLogDrawerSize] = useState<LogDrawerSize>("tiny");
  const tinyLogRef = useRef<HTMLDivElement>(null);
  const nonTinyLogRef = useRef<HTMLDivElement>(null);
  const logWrapperRef = logDrawerSize === "tiny" ? tinyLogRef : nonTinyLogRef;
  const logWrapperElement = logWrapperRef.current;
  const scrollBottom =
    (logWrapperElement?.scrollTop ?? 0) +
    (logWrapperElement?.clientHeight ?? 0);
  const scrollHeight = logWrapperElement?.scrollHeight ?? 0;
  const scrollDistanceToBottom = Math.abs(scrollBottom - scrollHeight);
  const shouldScrollToBottom = scrollDistanceToBottom < 10;
  const [searchTerm, setSearchTerm] = useState("");
  const { logs, tailLogs } = useRelevantLogs({
    searchTerm,
    tailSize: 5,
  });
  const mouseEvent = useMouseMove(trackMousePosition);

  const getDrawerSizeClass = useCallback(() => {
    return logDrawerSize === "tiny"
      ? ""
      : logDrawerSize === "small"
      ? classes.opened
      : classes.expanded;
  }, [logDrawerSize]);

  const scrollToBottom = (smooth = true) => {
    if (!shouldScrollToBottom) {
      return;
    }
    if (logWrapperRef.current) {
      const options: ScrollToOptions = {
        top: logWrapperRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      };
      logWrapperRef.current.scrollTo(options);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logDrawerSize, shouldScrollToBottom]);

  useEffect(() => {
    const hasErrorLogs = logs.some(
      (log) => log.source === ProcessOutputSource.OUTPUT_SOURCE_STDERR,
    );
    if (hasErrorLogs) {
      toast.error("Some process encountered errors", {
        duration: 4000,
      });
    }

    scrollToBottom();
  }, [logs]);

  const onCaretChange = useCallback((isExpanded: boolean) => {
    if (isExpanded) {
      changeLogDrawerSize("tiny");
    } else {
      changeLogDrawerSize("small");
    }
  }, []);

  const changeLogDrawerSize = useCallback((size: LogDrawerSize) => {
    setLogDrawerSize(size);
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
      setLogDrawerSize("tiny");
      setTrackMousePosition(false);
    }
  }, [mouseEvent]);

  const startPositionDrag = useCallback(() => {
    setTrackMousePosition(true);
    setLogDrawerSize("custom");
  }, []);

  const endPositionDrag = useCallback(() => {
    setTrackMousePosition(false);
  }, []);

  return (
    <div
      className={classNames(
        classes.root,
        getDrawerSizeClass(),
        props.className,
      )}
      style={logDrawerSize === "custom" ? { top: mouseEvent?.clientY } : {}}
    >
      <VerticalDragLine
        isActive={trackMousePosition}
        startPositionDrag={startPositionDrag}
        endPositionDrag={endPositionDrag}
      />

      <div
        className={classNames(classes.header, {
          [classes.expanded]: logDrawerSize !== "tiny",
        })}
      >
        <SimpleButton className={classes.logsButton}>
          <FlowserIcon.Logs />
          <span>LOGS</span>
        </SimpleButton>

        {logDrawerSize === "tiny" && (
          <div className={classes.midContainer} ref={tinyLogRef}>
            {tailLogs.map((log) => (
              <LogLine key={log.id} log={log} />
            ))}
          </div>
        )}

        <div className={classes.rightContainer}>
          <ConfigureYourAppHelp />
          {logDrawerSize !== "tiny" && (
            <SearchInput
              className={classes.searchBox}
              placeholder="Search logs ...."
              searchTerm={searchTerm}
              onChangeSearchTerm={setSearchTerm}
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
              <FlowserIcon.Expand
                className={classes.control}
                onClick={() => changeLogDrawerSize("big")}
              />
            )}
            {logDrawerSize === "big" && (
              <FlowserIcon.Shrink
                className={classes.control}
                onClick={() => changeLogDrawerSize("small")}
              />
            )}
          </div>
        </div>
      </div>

      {logDrawerSize !== "tiny" && (
        <div className={classes.bigLogsContainer} ref={nonTinyLogRef}>
          {logs.map((log) => (
            <LogLine key={log.id} log={log} />
          ))}
          {logs.length === 0 && <NoLogsHelpBanner />}
        </div>
      )}
    </div>
  );
}

function LogLine({ log }: { log: ManagedProcessOutput }) {
  return (
    <pre
      className={classes.line}
      style={
        // TODO(ui): use color from color pallet
        log.source === ProcessOutputSource.OUTPUT_SOURCE_STDERR
          ? { color: "#D02525" }
          : {}
      }
      dangerouslySetInnerHTML={{
        __html: formatProcessOutput(log),
      }}
    />
  );
}

function formatProcessOutput(log: ManagedProcessOutput): string {
  const convert = new AnsiHtmlConvert({
    // See default colors used:
    // https://github.com/rburns/ansi-to-html/blob/master/lib/ansi_to_html.js#L12
    colors: {
      4: "#9bdefa",
    },
  });
  // The msg field in logs can contain escaped ansi codes
  // We need to unescape them so that they can be parsed by ansi-to-html lib
  const unescaped = log.data.replace(/\\x1b/g, "\x1b");
  return convert.toHtml(unescaped);
}

function NoLogsHelpBanner() {
  return (
    <Callout
      icon="❓"
      title="No logs found"
      description={
        <div>
          <p>
            Flowser isn't running any Flow development services (emulator or wallet).
          </p>
          <p>
            You are probably running these services yourself with Flow CLI.
          </p>
        </div>
      }
    />
  );
}

function useRelevantLogs(options: {
  searchTerm: string | undefined;
  tailSize: number;
}) {
  const { data: emulatorLogs } = useGetOutputsByProcess(emulatorProcessId);
  const { data: devWalletLogs } = useGetOutputsByProcess(devWalletProcessId);
  const combinedLogs = useMemo(() => {
    const logs = [];

    if (emulatorLogs) {
      logs.push(...emulatorLogs)
    }

    if (devWalletLogs) {
      logs.push(...devWalletLogs)
    }

    return logs.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    )
  }, [emulatorLogs, devWalletLogs])
  const { filteredData: logs } = useFilterData(
    combinedLogs,
    options.searchTerm,
  );
  const tailLogs = useMemo(
    () => logs.slice(logs.length - options.tailSize, logs.length),
    [logs],
  );

  return {
    logs,
    tailLogs,
  };
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

function ConfigureYourAppHelp() {
  const [showHelp, setShowHelp] = useState(false);
  // TODO(web-app): Read from a global configuration provider instead of parsing process flags
  const {data: processes} = useGetProcesses();
  const devWalletProcess = processes?.find(e => e.id === devWalletProcessId);
  const emulatorProcess = processes?.find(e => e.id === emulatorProcessId);
  const walletPort = Number(devWalletProcess?.command?.args?.find(arg => arg.startsWith("--port"))?.split("=")?.[1] || 8701);
  const restApiPort = Number(emulatorProcess?.command?.args?.find(arg => arg.startsWith("--rest-port"))?.split("=")?.[1] || 8888);

  const configJsCode = `import * as fcl from "@onflow/fcl"

fcl
  .config()
  // Point App at Emulator REST API
  .put("accessNode.api", "http://localhost:${restApiPort}")
  // Point FCL at Flow development wallet
  .put("discovery.wallet", "http://localhost:${walletPort}/fcl/authn")`;

  return (
    <Fragment>
      {showHelp && (
        <BaseDialog onClose={() => setShowHelp(false)}>
          <h2>Configure your application</h2>
          <SizedBox height={20} />
          <p>
            Use this code to setup FCL (Flow Client Library) to work with your local development environment.
          </p>
          <SizedBox height={10} />
          <CadenceEditor value={configJsCode} />
          <SizedBox height={10} />
          <ExternalLink href="https://developers.flow.com/tools/clients/fcl-js/api#common-configuration-keys">
            Learn more in the official docs
          </ExternalLink>
        </BaseDialog>
      )}
      <div className={classes.configureAppLabel} onClick={() => setShowHelp(true)}>
        🚀 Configure your app
      </div>
    </Fragment>
  )
}

const emulatorProcessId = "emulator";
const devWalletProcessId = "dev-wallet";
