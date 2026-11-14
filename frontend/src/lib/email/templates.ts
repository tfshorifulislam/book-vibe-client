import { formatCurrency } from "@/lib/utils";

const BRAND_NAME = "BookHand";
const BRAND_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f2; color: #2d261e; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e8e3dc; overflow: hidden; }
    .header { background: #8B5E3C; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px 24px; font-size: 15px; line-height: 1.6; }
    .button { display: inline-block; background: #8B5E3C; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #8c827a; background: #faf8f5; border-top: 1px solid #e8e3dc; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .table th { text-align: left; padding: 8px; border-bottom: 2px solid #e8e3dc; font-size: 12px; text-transform: uppercase; color: #8c827a; }
    .table td { padding: 10px 8px; border-bottom: 1px solid #f0ebe4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p>Your Trusted Books Marketplace · Bangladesh</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
      <p>Questions? Contact <a href="${BRAND_URL}/help" style="color: #8B5E3C;">Help Center</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function verificationEmailTemplate(
  name: string,
  verificationUrl: string,
): { subject: string; html: string } {
  const content = `
    <h2>Welcome to BookHand, ${name}!</h2>
    <p>Thank you for creating an account. Please verify your email address to unlock your full bookstore experience.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button" style="color: #ffffff;">Verify My Email Address</a>
    </div>
    <p style="font-size: 12px; color: #8c827a;">If you did not sign up for BookHand, you can safely ignore this email.</p>
  `;
  return {
    subject: "Verify your BookHand Account",
    html: baseLayout("Verify your Account", content),
  };
}

export function passwordResetEmailTemplate(
  name: string,
  resetUrl: string,
): { subject: string; html: string } {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your BookHand account. Click the button below to set a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button" style="color: #ffffff;">Reset My Password</a>
    </div>
    <p style="font-size: 12px; color: #8c827a;">This link will expire in 60 minutes. If you did not request a password reset, no action is required.</p>
  `;
  return {
    subject: "Reset your BookHand Password",
    html: baseLayout("Password Reset", content),
  };
}

export const emailVerificationEmail = verificationEmailTemplate;
export const passwordResetEmail = passwordResetEmailTemplate;

export function orderConfirmationEmailTemplate(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: { title: string; quantity: number; price: number }[];
}): { subject: string; html: string } {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td>${item.title}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `,
    )
    .join("");

  const content = `
    <h2>Order Placed Successfully!</h2>
    <p>Dear ${order.customerName},</p>
    <p>Thank you for your order! Your order <strong>${order.orderNumber}</strong> has been received and is being processed by our seller partners.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Book Title</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 16px;">
      Total: ${formatCurrency(order.total)}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${BRAND_URL}/buyer/orders" class="button" style="color: #ffffff;">Track Your Order</a>
    </div>
  `;
  return {
    subject: `Order Confirmed: ${order.orderNumber}`,
    html: baseLayout("Order Confirmed", content),
  };
}

export function paymentConfirmationEmailTemplate(
  orderNumber: string,
  customerName: string,
  amount: number,
  method: string,
): { subject: string; html: string } {
  const content = `
    <h2>Payment Received</h2>
    <p>Dear ${customerName},</p>
    <p>We have successfully received your payment of <strong>${formatCurrency(amount)}</strong> for Order <strong>${orderNumber}</strong> via <strong>${method}</strong>.</p>
    <p>Your order is now confirmed and our sellers are preparing it for shipment.</p>
  `;
  return {
    subject: `Payment Confirmed for Order ${orderNumber}`,
    html: baseLayout("Payment Confirmed", content),
  };
}

export function shippingNotificationEmailTemplate(
  orderNumber: string,
  customerName: string,
  carrier: string,
  trackingNumber?: string,
): { subject: string; html: string } {
  const content = `
    <h2>Your Books are on the Way!</h2>
    <p>Dear ${customerName},</p>
    <p>Great news! Order <strong>${orderNumber}</strong> has been dispatched for delivery.</p>
    <p><strong>Courier Carrier:</strong> ${carrier}</p>
    ${trackingNumber ? `<p><strong>Tracking Number:</strong> <code style="background: #f0ebe4; padding: 2px 6px; border-radius: 4px;">${trackingNumber}</code></p>` : ""}
    <div style="text-align: center; margin-top: 20px;">
      <a href="${BRAND_URL}/buyer/orders" class="button" style="color: #ffffff;">View Live Tracking</a>
    </div>
  `;
  return {
    subject: `Order Shipped: ${orderNumber}`,
    html: baseLayout("Order Shipped", content),
  };
}

export function refundStatusEmailTemplate(
  orderNumber: string,
  customerName: string,
  status: string,
  amount: number,
): { subject: string; html: string } {
  const content = `
    <h2>Refund Update for Order ${orderNumber}</h2>
    <p>Dear ${customerName},</p>
    <p>Your refund request for Order <strong>${orderNumber}</strong> in the amount of <strong>${formatCurrency(amount)}</strong> has been updated to: <strong>${status}</strong>.</p>
    <p>If you have any questions regarding your refund settlement, please contact support.</p>
  `;
  return {
    subject: `Refund Update: Order ${orderNumber}`,
    html: baseLayout("Refund Status", content),
  };
}
