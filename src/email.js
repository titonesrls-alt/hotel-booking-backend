import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMail({ subject, text, html, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject,
      text,
      html,
      attachments
    });
    return info;
  } catch (err) {
    // Logging dettagliato NO credenziali
    const safeErr = {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      response: err?.response,
      responseCode: err?.responseCode,
      command: err?.command
    };
    console.error('SMTP sendMail error:', safeErr);
    throw err;
  }
}

export default transporter;
