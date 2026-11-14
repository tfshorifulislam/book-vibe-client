export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};
