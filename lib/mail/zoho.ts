import nodemailer from 'nodemailer';

const host = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in';
const port = Number(process.env.ZOHO_SMTP_PORT || 465);
const user = process.env.ZOHO_SMTP_USER;
const pass = process.env.ZOHO_SMTP_PASSWORD;
const to = process.env.ADMIN_NOTIFICATION_EMAIL;

export const mailEnabled = Boolean(user && pass && to);

const transporter = mailEnabled
  ? nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 465,
      secure: (process.env.ZOHO_SMTP_SECURE || 'true') === 'true',
      auth: { user: user as string, pass: pass as string },
    })
  : null;

export async function sendAdminMail(subject: string, text: string) {
  if (!transporter || !user || !to) return false;

  try {
    await transporter.sendMail({ from: user, to, subject, text });
    return true;
  } catch (error) {
    // Notifications must never fail the user's request.
    console.error('Admin email notification failed:', error);
    return false;
  }
}
