import { ImageResponse } from 'next/og';
import { FlixUtils } from "@onflowser/core/src/flix-utils";
import { FlixTemplate, FlixAuditor } from "@onflowser/core/src/flow-flix.service";
import { InteractionsPageParams } from '@/common/use-interaction-page-params';
import { FlowserIcon } from "@onflowser/ui/src/common/icons/FlowserIcon";

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

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "white",
            color: "#31363d",
            height: '100%',
            width: '100%',
            padding: 50,
            rowGap: 20
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
          {auditors.length > 0 && (
            <div
              style={{
                display: "flex",
                columnGap: 10,
                fontSize: 20
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FlowserIcon.VerifiedCheck style={{ color: "#01ec8a" }} />
                Verified
              </span>
              <span>
                {auditors.length} Auditor{auditors.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
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

async function fetchFont(path: string) {
  console.log(path)
  return fetch(
    new URL(path, import.meta.url)
  ).then((res) => res.arrayBuffer())
}
