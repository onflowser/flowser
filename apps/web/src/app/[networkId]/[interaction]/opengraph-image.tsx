import { ImageResponse } from 'next/og';
import { FlixUtils } from "@onflowser/core/src/flix-utils";
import { FlixTemplate, FlixAuditor } from "@onflowser/core/src/flow-flix.service";
import { InteractionsPageParams } from '@/common/use-interaction-page-params';
import { FlowserIcon } from "@onflowser/ui/src/common/icons/FlowserIcon";
import { FlowNetworkId } from "@onflowser/core/src/flow-utils";

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

  const [interBold, interRegular] = await Promise.all([
    fetch(new URL("./Inter-Bold.ttf", import.meta.url)).then((res) => res.arrayBuffer()),
    fetch(new URL("./Inter-Regular.ttf", import.meta.url)).then((res) => res.arrayBuffer())
  ])

  if (interaction) {
    const [flix, auditors] = await Promise.all([
      fetchFlixTemplateById(interaction),
      fetchFlixAuditorsById(interaction, networkId),
    ]);

    const dependencies = FlixUtils.getDependencies(flix, networkId);
    const profile = await getProfilesByAddress(dependencies[0].address, networkId);
    const avatarUrl = profile[0]?.avatar ?? "https://flowser.dev/icon.png";

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
              color: "#31363d",
              rowGap: 20,
              flex: 5
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <span
                style={{
                  fontSize: 100,
                  fontWeight: 800
                }}
              >
                {FlixUtils.getName(flix)}
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  color: "#616569"
                }}
                >
                {FlixUtils.getDescription(flix)}
              </span>
            </div>
            {auditors.length > 0 && (
              <div
                style={{
                  display: "flex",
                  columnGap: 30,
                  fontSize: 20
                }}
              >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 10,
                }}
              >
                <FlowserIcon.VerifiedCheck style={{ color: "#01ec8a" }} />
                Verified
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 10,
                }}
              >
                <FlowserIcon.Star style={{ color: "#616569", transform: 'scale(1.3)' }} />
                {auditors.length} Auditor{auditors.length > 1 ? "s" : ""}
              </span>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flex: 1
          }}
          >
            <img
              alt=""
              src={avatarUrl}
            />
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Inter',
            data: interBold,
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

async function getProfilesByAddress(address: string, networkId: FlowNetworkId) {
  const res = await fetch(`${getApiRouteHost()}/get-address-info?address=${address}&networkId=${networkId}`);
  return await res.json();
}

// TODO: This wont work in preview deployments
function getApiRouteHost() {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return "http://localhost:3000"
  } else {
    return "https://interact.flowser.dev/"
  }
}
