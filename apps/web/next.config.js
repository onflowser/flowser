/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flowser.dev",
        port: ""
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/previewnet",
        permanent: true
      },
      // Redirect to the main release that doesn't support Cadence v1.0
      {
        source: "/mainnet",
        destination: "https://interact.flowser.dev/mainnet",
        permanent: true
      },
      {
        source: "/testnet",
        destination: "https://interact.flowser.dev/testnet",
        permanent: true
      }
    ]
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    // This should match the config in `webpack.config.renderer.dev.ts` and `webpack.config.renderer.prod.ts`
    config.module.rules.push(
      // SVG
      // https://react-svgr.com/docs/webpack/#use-svgr-and-asset-svg-in-the-same-project
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        // https://github.com/gregberge/svgr/issues/142
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              // Disable SVGO, since that tool stripes viewBox attribute
              // and I can't figure out how to disable that.
              // https://react-svgr.com/docs/options/#svgo
              // https://github.com/gregberge/svgr/discussions/735
              svgo: false,
            },
          },
        ],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },

  // ...other config
}

module.exports = nextConfig
