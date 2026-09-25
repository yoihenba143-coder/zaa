// Email service supporting Resend, Brevo (Sendinblue), SendGrid, and Dev Mode

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{
  success: boolean;
  provider: string;
  error?: string;
}> {
  const fromEmail = process.env.EMAIL_FROM || "ZAA Clothing <onboarding@resend.dev>";


  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ""),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Resend API error:", data);
        return { success: false, provider: "Resend", error: data.message || "Failed to send email" };
      }
      return { success: true, provider: "Resend" };
    } catch (err) {
      console.error("Resend send error:", err);
      return { success: false, provider: "Resend", error: String(err) };
    }
  }

 
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "ZAA", email: process.env.BREVO_SENDER_EMAIL || fromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Brevo API error:", errorData);
        return { success: false, provider: "Brevo", error: errorData.message || "Failed to send email" };
      }
      return { success: true, provider: "Brevo" };
    } catch (err) {
      console.error("Brevo send error:", err);
      return { success: false, provider: "Brevo", error: String(err) };
    }
  }

 
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("SendGrid API error:", errorText);
        return { success: false, provider: "SendGrid", error: errorText };
      }
      return { success: true, provider: "SendGrid" };
    } catch (err) {
      console.error("SendGrid send error:", err);
      return { success: false, provider: "SendGrid", error: String(err) };
    }
  }

 
  console.log("=================================================");
  console.log("📧 [EMAIL SERVICE - DEVELOPMENT SIMULATION]");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("Status: Email simulated successfully (Configure RESEND_API_KEY or BREVO_API_KEY in .env for live inbox delivery)");
  console.log("=================================================");

  return { success: true, provider: "Dev-Simulation" };
}

export function generatePasswordResetEmailHtml(customerName: string, resetUrl: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your ZAA Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 40px 32px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 24px; text-align: center; }
        .logo-red { color: #dc2626; }
        .heading { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #ffffff; text-align: center; }
        .text { font-size: 15px; line-height: 24px; color: #a1a1aa; margin-bottom: 24px; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
        .expiry { font-size: 13px; color: #71717a; text-align: center; margin-top: 16px; }
        .footer { border-top: 1px solid #27272a; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #52525b; text-align: center; }
        .link-text { color: #dc2626; word-break: break-all; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <span class="logo-red">Z</span><span>AA</span>
        </div>
        <h1 class="heading">Password Reset Request</h1>
        <p class="text">Hi ${customerName || "there"},</p>
        <p class="text">We received a request to reset your password for your ZAA account. Click the button below to choose a new password:</p>
        <div class="btn-wrapper">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p class="expiry">⏳ This link is valid for <strong>30 minutes</strong>.</p>
        <p class="text" style="font-size: 13px; margin-top: 24px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" class="link-text">${resetUrl}</a>
        </p>
        <div class="footer">
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <p>© ${new Date().getFullYear()} ZAA • Zero Authority Artists</p>
        </div>
      </div>
    </body>
  </html>
  `;
}
