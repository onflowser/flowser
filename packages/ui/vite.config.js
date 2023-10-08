import ViteSvgPlugin from "vite-plugin-svgr";
import * as path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [ViteSvgPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
              @import "./src/styles/animations.scss";
              @import "./src/styles/colors.scss";
              @import "./src/styles/scrollbars.scss";
              @import "./src/styles/spacings.scss";
              @import "./src/styles/typography.scss";
              @import "./src/styles/rules.scss";`,
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Flowser UI",
      fileName: (format) => `flowser.${format}.js`,
    },
    rollupOptions: {
      // Ensure to add external dependencies to avoid bundling them in your library
      external: ["react", "react-dom"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
