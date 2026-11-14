/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { createJiti } = require("jiti");

const projectRoot = path.resolve(__dirname, "../..");

const jiti = createJiti(path.join(projectRoot, "package.json"), {
  alias: {
    "@": path.join(projectRoot, "src"),
    "server-only": path.join(projectRoot, "node_modules/server-only/empty.js"),
  },
});

jiti("./src/server/index.ts");
