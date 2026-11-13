/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const createJiti = require("jiti");

const jiti = createJiti(__filename, {
  alias: {
    "server-only": path.join(__dirname, "../node_modules/server-only/empty.js"),
    "@": path.join(__dirname, "../src"),
  },
});

jiti("./run-all.ts");
