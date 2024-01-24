import { ImageResponse } from 'next/og';
import { FlixUtils } from "@onflowser/core/src/flix-utils";
import { FlixTemplate } from "@onflowser/core/src/flow-flix.service";
import { InteractionsPageParams } from '@/common/use-params';

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

  if (interaction) {
    const flix = await fetchFlixTemplateById(interaction);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            color: '#e5e5e5',
            background: '#262b32',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            padding: 20,
            paddingBottom: 0
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: 20
            }}
            >
              <span
                style={{ fontSize: 60 }}
              >
                {FlixUtils.getName(flix)}
              </span>
              <span
                style={{
                  fontSize: 30,
                  maxWidth: 600,
              }}
              >
                {FlixUtils.getDescription(flix)}
              </span>
            </div>
            <img
              width="256"
              height="256"
              src="https://flowser.dev/icon.png"
              style={{
                borderRadius: 128,
              }}
            />
          </div>
          <pre
            style={{
              fontSize: 18,
              color: "#8b949e"
          }}
          >
            {FlixUtils.getCadenceSourceCode(flix, networkId)}
          </pre>
        </div>
      ),
      size
    );
  }

  return new ImageResponse(<>Unknown interaction</>, size);
}

// We can't use the standard FlixService,
// since that uses axios to for network calls
// and axios can't be used in edge runtime.
// See: https://github.com/axios/axios/issues/5523
async function fetchFlixTemplateById(id: string): Promise<FlixTemplate> {
  const res = await fetch(`https://flowser-flix-368a32c94da2.herokuapp.com/v1/templates/${id}`);
  return await res.json();
}
