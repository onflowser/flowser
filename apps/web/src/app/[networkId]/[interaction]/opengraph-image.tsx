import { ImageResponse } from 'next/og';
import { FlixUtils } from "@onflowser/core/src/flix-utils";
import type { InteractionsPageParams } from '@/common/use-interaction-page-params';
import type { FlowNetworkId } from "@onflowser/core/src/flow-utils";
import type { FlowNameProfile } from "@onflowser/core/src/flow-names.service";
import { FlowUtils } from "@onflowser/core/src/flow-utils";
import { FlixAuditor, FlixTemplateV1 } from "@onflowser/core/src/flix-v1";

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

    if (!flix) {
      return new ImageResponse(<FallbackPreview />, size);
    }

    const cadenceSourceCode = FlixUtils.getCadenceSourceCode(flix, networkId);
    const dependencies = FlixUtils.getDependencies(flix, networkId);
    const address = dependencies[0].address;

    const [flowNameProfiles, addressIndex] = await Promise.all([
      getProfilesByAddress(address, networkId),
      getAddressIndex(address, networkId)
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            background: "white",
            height: size.height,
            width: size.width,
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
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flex: 1
          }}
          >
            <AccountImage addressIndex={addressIndex} profiles={flowNameProfiles} />
            <FlowserLogo size={40} />
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

  return new ImageResponse(<FallbackPreview />, size);
}

function FallbackPreview() {
  return (
    <img style={size} alt="" src="https://flowser.dev/social.png" />
  )
}

function TitleAndDescription(props: {flix: FlixTemplateV1}) {
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
  const iconSize = 25;

  if (auditors.length === 0) {
    return null;
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
        <RiVerifiedBadgeFill size={iconSize} color="#01ec8a" />
        Verified
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: 10,
        }}
      >
        <RiStarFill size={iconSize} color="#B5B5B5" />
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
        padding: 20,
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
        <code style={{ color: "#747474", fontSize: 15, marginTop: 10 }}>
          + {hiddenLinesCount} lines
        </code>
      )}
    </pre>
  )
}

function FlowserLogo(props: { size: number }) {
  return (
    <img
      alt=""
      src="https://flowser.dev/icon.png"
      style={{
        width: props.size,
        height: props.size,
        transform: "scale(1.2)"
      }}
    />
  )
}

function AccountImage(props: { addressIndex: number; profiles: FlowNameProfile[]}) {
  // Total default avatar count listed in:
  // https://github.com/onflowser/flowser/tree/main/packages/ui/src/accounts/AccountAvatar/avatars
  const totalDefaultAvatarCount = 16;
  const defaultAvatarIndex = props.addressIndex % totalDefaultAvatarCount;
  const defaultAvatarUrl = `https://github.com/onflowser/flowser/blob/main/packages/ui/src/accounts/AccountAvatar/avatars/${defaultAvatarIndex}.jpg?raw=true`
  const avatarUrl = props.profiles[0]?.avatar ?? defaultAvatarUrl;
  return (
    <img
      alt=""
      src={avatarUrl}
      style={{
        borderRadius: 20
      }}
    />
  )
}

type IconProps = {
  size: number;
  color: string;
}

// SVG code copied here to limit imported lib size and avoid max code size limitations (1MB).
// https://react-icons.github.io/react-icons/search/#q=RiVerifiedBadgeFill
function RiVerifiedBadgeFill(props: IconProps) {
  return (
    <svg stroke={props.color} fill={props.color} width={props.size} height={props.size} strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>
  )
}

// SVG code copied here to limit imported lib size and avoid max code size limitations (1MB).
// https://react-icons.github.io/react-icons/search/#q=RiStarFill
function RiStarFill(props: IconProps) {
  return (
    <svg stroke={props.color} fill={props.color} width={props.size} height={props.size} strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></svg>
  )
}

// We can't use the standard FlixService,
// since that uses axios to for network calls
// and axios can't be used in edge runtime.
// See: https://github.com/axios/axios/issues/5523

const flixApiHost = `https://flowser-flix-368a32c94da2.herokuapp.com`;

async function fetchFlixTemplateById(id: string): Promise<FlixTemplateV1 | undefined> {
  const res = await fetch(`${flixApiHost}/v1/templates/${id}`);
  if (res.status === 200) {
    return await res.json();
  } else {
    return undefined;
  }
}

async function fetchFlixAuditorsById(id: string, networkId: string): Promise<FlixAuditor[]> {
  const res = await fetch(`${flixApiHost}/v1/templates/${id}/auditors?network=${networkId}`);
  return await res.json();
}

async function getProfilesByAddress(address: string, networkId: FlowNetworkId): Promise<FlowNameProfile[]> {
  const res = await fetch(`${getApiRouteHost()}/get-address-info?address=${address}&networkId=${networkId}`);
  return await res.json();
}

async function getAddressIndex(address: string, networkId: FlowNetworkId): Promise<number> {
  const res = await fetch(`${getApiRouteHost()}/get-address-index?address=${address}&chainId=${FlowUtils.networkIdToChainId(networkId)}`);
  const data = await res.json();
  return data.index as number;
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
