import { Router } from "express";

import { prisma } from "@/lib/db";
import { verifyBkashPayment } from "@/lib/payments/bkash";
import { verifySSLCommerzPayment } from "@/lib/payments/sslcommerz";

const router = Router();

// GET/POST /api/payments/bkash/callback
router.all("/payments/bkash/callback", async (req, res, next) => {
  try {
    const paymentId = (req.query.paymentID || req.body.paymentID) as string;
    const status = (req.query.status || req.body.status) as string;
    const orderId = (req.query.orderId || req.body.orderId) as string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (status === "success" && paymentId) {
      const verification = await verifyBkashPayment(paymentId);
      if (verification.success && orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            payment: {
              update: {
                status: "PAID",
                transactionRef: verification.transactionRef || paymentId,
              },
            },
          },
        });
        return res.redirect(
          `${siteUrl}/buyer/orders/${orderId}?payment=success`,
        );
      }
    }

    return res.redirect(
      `${siteUrl}/buyer/orders/${orderId || ""}?payment=failed`,
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/sslcommerz/callback
router.post("/payments/sslcommerz/callback", async (req, res, next) => {
  try {
    const valId = req.body.val_id;
    const tranId = req.body.tran_id;
    const status = (req.query.status || req.body.status) as string;
    const orderId = (req.query.orderId || req.body.orderId) as string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (status === "success" && valId) {
      const verification = await verifySSLCommerzPayment(valId);
      if (verification.success && orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            payment: {
              update: {
                status: "PAID",
                transactionRef: tranId || valId,
              },
            },
          },
        });
        return res.redirect(
          `${siteUrl}/buyer/orders/${orderId}?payment=success`,
        );
      }
    }

    return res.redirect(
      `${siteUrl}/buyer/orders/${orderId || ""}?payment=failed`,
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/stripe/webhook
router.post("/payments/stripe/webhook", async (req, res) => {
  try {
    const event = req.body;
    if (event?.type === "checkout.session.completed") {
      const session = event.data?.object;
      const orderId = session?.client_reference_id;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            payment: {
              update: {
                status: "PAID",
                transactionRef: session.id,
              },
            },
          },
        });
      }
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook Error]", error);
    return res.status(400).json({ error: "Webhook handler failed" });
  }
});

export default router;
