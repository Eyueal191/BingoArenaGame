import transporter from "../config/nodemailer.js";

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"BingoArena Game" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || "", // optional plain text
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return { success: false, message: error.message };
  }
};

export default sendEmail;
