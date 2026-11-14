import { Router } from "express";

import accountRoutes from "./account.routes";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import booksRoutes from "./books.routes";
import commerceRoutes from "./commerce.routes";
import communityRoutes from "./community.routes";
import paymentsRoutes from "./payments.routes";
import sellerRoutes from "./seller.routes";
import uploadRoutes from "./upload.routes";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "BookHand REST API",
  });
});

// Mount all modular routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/account", accountRoutes);
apiRouter.use("/", booksRoutes);
apiRouter.use("/", commerceRoutes);
apiRouter.use("/", communityRoutes);
apiRouter.use("/", uploadRoutes);
apiRouter.use("/", paymentsRoutes);
apiRouter.use("/", sellerRoutes);
apiRouter.use("/", adminRoutes);

export default apiRouter;
