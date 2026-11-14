/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const createJiti = require("jiti");

const backendRoot = path.resolve(__dirname, "..");

const jiti = createJiti(__filename, {
  alias: {
    "server-only": path.join(backendRoot, "node_modules/server-only/empty.js"),
    "@": path.join(backendRoot, "src"),
  },
});

jiti("./run-all.ts");
