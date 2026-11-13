export type PaymentMethod =
  "COD" | "BKASH" | "SSLCOMMERZ" | "STRIPE" | "NAGAD" | "CARD";

export type PaymentInitiateInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  callbackUrl?: string;
};

export type PaymentInitiateResult = {
  success: boolean;
  paymentUrl?: string;
  transactionRef?: string;
  error?: string;
};

export type PaymentVerificationResult = {
  success: boolean;
  orderNumber: string;
  amount: number;
  transactionRef: string;
  gatewayStatus: string;
  error?: string;
};
