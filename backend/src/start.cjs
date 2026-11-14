/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { createJiti } = require("jiti");

const backendRoot = path.resolve(__dirname, "..");

const jiti = createJiti(path.join(backendRoot, "package.json"), {
  alias: {
    "@": path.join(backendRoot, "src"),
    "server-only": path.join(backendRoot, "node_modules/server-only/empty.js"),
  },
});

jiti("./src/index.ts");
