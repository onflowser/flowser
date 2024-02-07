import { ImageResponse } from 'next/og';
import { FlixUtils } from "@onflowser/core/src/flix-utils";
import { FlixTemplate, FlixAuditor } from "@onflowser/core/src/flow-flix.service";
import { InteractionsPageParams } from '@/common/use-interaction-page-params';
import { FlowserIcon } from "@onflowser/ui/src/common/icons/FlowserIcon";
import { FlowNetworkId } from "@onflowser/core/src/flow-utils";
import { FlowNameProfile } from "@onflowser/core/src/flow-names.service";

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

type Props = {
  params: InteractionsPageParams;
}

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
export default async function Image(props: Props) {
  const {interaction, networkId} = props.params;

  const [interBlack, interRegular] = await Promise.all([
    fetch(new URL("./Inter-Black.ttf", import.meta.url)).then((res) => res.arrayBuffer()),
    fetch(new URL("./Inter-Regular.ttf", import.meta.url)).then((res) => res.arrayBuffer())
  ])

  if (interaction) {
    const [flix, auditors] = await Promise.all([
      fetchFlixTemplateById(interaction),
      fetchFlixAuditorsById(interaction, networkId),
    ]);

    const dependencies = FlixUtils.getDependencies(flix, networkId);
    const flowNameProfiles = await getProfilesByAddress(dependencies[0].address, networkId);
    const cadenceSourceCode = FlixUtils.getCadenceSourceCode(flix, networkId);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            background: "white",
            height: '100%',
            width: '100%',
            padding: 50,
            columnGap: 20
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              rowGap: 30,
              flex: 5,
            }}
          >
            <TitleAndDescription flix={flix} />
            <AuditorInfo auditors={auditors} />
            <CodePreview cadence={cadenceSourceCode} />
          </div>
          <div
            style={{
              display: "flex",
              flex: 1
          }}
          >
            <AccountImage profiles={flowNameProfiles} />
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Inter',
            data: interBlack,
            weight: 800
          },
          {
            name: 'Inter',
            data: interRegular,
            weight: 400
          },
        ]
      }
    );
  }

  return new ImageResponse(<>Unknown interaction</>, size);
}

function TitleAndDescription(props: {flix: FlixTemplate}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: 10,
      }}
    >
      <span
        style={{
          fontSize: 100,
          lineHeight: 1,
          fontWeight: 800,
          color: "#31363C",
        }}
      >
        {FlixUtils.getName(props.flix)}
      </span>
      <span
        style={{
          fontSize: 40,
          fontWeight: 400,
          color: "#56595E",
        }}
      >
        {FlixUtils.getDescription(props.flix)}
      </span>
    </div>
  )
}

function AuditorInfo(props: { auditors: FlixAuditor[]}) {
  const {auditors} = props;

  if (auditors.length === 0) {
    return null;
  }

  const commonIconStyle = {
    width: 25,
    height: 25
  }

  return (
    <div
      style={{
        display: "flex",
        columnGap: 30,
        fontSize: 25,
        color: "#31363C",
        flex: 1,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: 10,
        }}
      >
        <FlowserIcon.VerifiedCheck
          style={{ color: "#01ec8a", ...commonIconStyle }}
        />
        Verified
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: 10,
        }}
      >
        <FlowserIcon.StarFill style={{ color: "#B5B5B5", ...commonIconStyle }} />
        {auditors.length} Auditor{auditors.length > 1 ? "s" : ""}
      </span>
    </div>
  )
}

function CodePreview(props: {cadence: string}) {
  const sourceCodeLines = props.cadence.split("\n");
  const linesToShow = 10;
  const excludeComments = true;
  const trimmedCodeLines = sourceCodeLines
    .filter(row => excludeComments ? !isComment(row) : true)
    .filter(row => row.trim().length > 0);
  const shownLines = trimmedCodeLines.slice(0, linesToShow);
  const hiddenLinesCount = trimmedCodeLines.length - linesToShow;

  return (
    <pre
      style={{
        background: "#f4f4f4",
        borderRadius: 20,
        padding: 10,
        overflow: "hidden",
        fontSize: 22,
        display: "flex",
        flexDirection: "column",
      }}
    >
    {shownLines.map((row) => (
      <code
        key={row}
        style={{
          // Make comments less visible
          color: isComment(row) ? "rgba(116,116,116,0.49)" : "#747474",
          minHeight: 24,
        }}
      >
        {row}
      </code>
    ))}
        {hiddenLinesCount > 0 && (
          <code style={{ color: "#747474", fontSize: 15, marginTop: 5 }}>
            + {hiddenLinesCount} lines
          </code>
        )}
    </pre>
  )
}

function AccountImage(props: {profiles: FlowNameProfile[]}) {
  const avatarUrl = props.profiles[0]?.avatar ?? "https://flowser.dev/icon.png";

  return (
    <img
      alt=""
      src={avatarUrl}
    />
  )
}

// We can't use the standard FlixService,
// since that uses axios to for network calls
// and axios can't be used in edge runtime.
// See: https://github.com/axios/axios/issues/5523

const flixApiHost = `https://flowser-flix-368a32c94da2.herokuapp.com`;

async function fetchFlixTemplateById(id: string): Promise<FlixTemplate> {
  const res = await fetch(`${flixApiHost}/v1/templates/${id}`);
  return await res.json();
}

async function fetchFlixAuditorsById(id: string, networkId: string): Promise<FlixAuditor[]> {
  const res = await fetch(`${flixApiHost}/v1/templates/${id}/auditors?network=${networkId}`);
  return await res.json();
}

async function getProfilesByAddress(address: string, networkId: FlowNetworkId): Promise<FlowNameProfile[]> {
  const res = await fetch(`${getApiRouteHost()}/get-address-info?address=${address}&networkId=${networkId}`);
  return await res.json();
}

// This wont work in preview deployments
function getApiRouteHost() {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return "http://localhost:3000"
  } else {
    return "https://interact.flowser.dev/"
  }
}

function isComment(code: string) {
  return /\/\/\//.test(code)
}
