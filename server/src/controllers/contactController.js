const nodemailer = require("nodemailer");

// Create a reusable Gmail transporter
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

/**
 * POST /api/contact
 * Sends the contact form submission directly to jj0942754@gmail.com via Gmail SMTP.
 */
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const transporter = createTransporter();

    // 1. Notification email to the site owner
    const ownerMailOptions = {
      from: `"LMS Academy Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // jj0942754@gmail.com
      replyTo: email.trim(),
      subject: `[LMS Contact] ${subject.trim()}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: #030712; padding: 28px 32px; text-align: center;">
            <h1 style="color: #10b981; margin: 0; font-size: 22px; letter-spacing: -0.5px;">
              📩 New Contact Message
            </h1>
            <p style="color: #6b7280; margin: 6px 0 0; font-size: 13px;">LMS Academy — Contact Form Submission</p>
          </div>

          <!-- Body -->
          <div style="background: #ffffff; padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; width: 120px;">
                  <span style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">From</span>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-size: 14px; font-weight: 600; color: #111827;">${name.trim()}</span>
                  <span style="font-size: 13px; color: #6b7280; margin-left: 8px;">&lt;${email.trim()}&gt;</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-size: 14px; font-weight: 600; color: #111827;">${subject.trim()}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Received</span>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-size: 13px; color: #6b7280;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" })} IST</span>
                </td>
              </tr>
            </table>

            <!-- Message Body -->
            <div style="margin-top: 24px;">
              <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Message</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px;">
                <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0; white-space: pre-line;">${message.trim()}</p>
              </div>
            </div>

            <!-- Reply CTA -->
            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${email.trim()}?subject=Re: ${subject.trim()}"
                 style="display: inline-block; background: #030712; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700;">
                Reply to ${name.trim()}
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 16px 32px; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              This message was sent from the LMS Academy contact form at lmsacademy.in
            </p>
          </div>
        </div>
      `,
    };

    // 2. Auto-reply to the sender
    const autoReplyOptions = {
      from: `"LMS Academy" <${process.env.GMAIL_USER}>`,
      to: email.trim(),
      subject: `We received your message — LMS Academy`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
          <div style="background: #030712; padding: 28px 32px; text-align: center;">
            <h1 style="color: #10b981; margin: 0; font-size: 22px;">Thanks for reaching out!</h1>
            <p style="color: #6b7280; margin: 6px 0 0; font-size: 13px;">LMS Academy Support</p>
          </div>
          <div style="background: #ffffff; padding: 32px;">
            <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">Hi <strong>${name.trim()}</strong>,</p>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.7; margin: 0 0 16px;">
              We've received your message about <strong>"${subject.trim()}"</strong> and our support team will get back to you within <strong>one business day</strong>.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
              <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin: 0 0 8px;">Your message</p>
              <p style="font-size: 13px; color: #374151; margin: 0; white-space: pre-line;">${message.trim()}</p>
            </div>
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              If this is urgent, you can also reach us at <a href="mailto:${process.env.GMAIL_USER}" style="color: #10b981;">${process.env.GMAIL_USER}</a>
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 16px 32px; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">© 2026 LMS Academy. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(autoReplyOptions),
    ]);

    console.log(`📧 Contact email sent from: ${email} | Subject: ${subject}`);

    return res.json({
      success: true,
      message: "Your message has been sent. We'll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error("submitContactMessage error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

module.exports = { submitContactMessage };
