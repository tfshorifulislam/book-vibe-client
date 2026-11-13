import "server-only";

import type {
  PaymentInitiateInput,
  PaymentInitiateResult,
  PaymentVerificationResult,
} from "./types";

const SSLCOMMERZ_BASE_URL =
  process.env.SSLCOMMERZ_IS_SANDBOX === "false"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

export async function initiateSslCommerzPayment(
  input: PaymentInitiateInput,
): Promise<PaymentInitiateResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;

  if (!storeId || !storePasswd) {
    return {
      success: false,
      error:
        "SSLCommerz credentials not configured. Configure SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD in .env.",
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: input.amount.toString(),
      currency: "BDT",
      tran_id: `TXN-${input.orderNumber}`,
      success_url: `${siteUrl}/api/payments/sslcommerz/callback?status=success&orderId=${input.orderId}`,
      fail_url: `${siteUrl}/api/payments/sslcommerz/callback?status=fail&orderId=${input.orderId}`,
      cancel_url: `${siteUrl}/api/payments/sslcommerz/callback?status=cancel&orderId=${input.orderId}`,
      ipn_url: `${siteUrl}/api/payments/sslcommerz/callback?status=ipn`,
      cus_name: input.customerName,
      cus_email: input.customerEmail,
      cus_phone: input.customerPhone || "01700000000",
      cus_add1: "Dhaka, Bangladesh",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: "Books",
      product_category: "Books",
      product_profile: "physical-goods",
    });

    const res = await fetch(`${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`, {
      method: "POST",
      body: params,
    });

    const data = await res.json();
    if (res.ok && data.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        success: true,
        paymentUrl: data.GatewayPageURL,
        transactionRef: data.sessionkey,
      };
    }

    return {
      success: false,
      error: data.failedreason || "Failed to initialize SSLCommerz payment",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function validateSslCommerzTransaction(
  valId: string,
): Promise<PaymentVerificationResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;

  if (!storeId || !storePasswd) {
    return {
      success: false,
      orderNumber: "",
      amount: 0,
      transactionRef: valId,
      gatewayStatus: "FAILED",
      error: "Missing SSLCommerz store credentials",
    };
  }

  try {
    const res = await fetch(
      `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePasswd}&format=json`,
    );
    const data = await res.json();
    if (data.status === "VALID" || data.status === "VALIDATED") {
      return {
        success: true,
        orderNumber: data.tran_id,
        amount: Number(data.amount),
        transactionRef: data.bank_tran_id || valId,
        gatewayStatus: data.status,
      };
    }
    return {
      success: false,
      orderNumber: data.tran_id || "",
      amount: 0,
      transactionRef: valId,
      gatewayStatus: data.status || "INVALID",
      error: "Transaction validation failed",
    };
  } catch (err) {
    return {
      success: false,
      orderNumber: "",
      amount: 0,
      transactionRef: valId,
      gatewayStatus: "ERROR",
      error: err instanceof Error ? err.message : "Validation request failed",
    };
  }
}
