import { app } from "./app";

const PORT = Number(process.env.API_PORT || process.env.PORT || 5000);

const server = app.listen(PORT, () => {
  console.log(
    `[Express] BookHand API server listening on http://localhost:${PORT}`,
  );
});

process.on("SIGTERM", () => {
  console.log("[Express] Received SIGTERM, shutting down gracefully...");
  server.close(() => {
    console.log("[Express] Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[Express] Received SIGINT, shutting down gracefully...");
  server.close(() => {
    console.log("[Express] Server closed.");
    process.exit(0);
  });
});

export default server;
