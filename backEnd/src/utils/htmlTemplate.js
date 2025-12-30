const htmlTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
        <div style="max-width:600px; margin:40px auto; background:#ffffff; padding:30px; border-radius:8px;">
          
          <h2 style="color:#333; text-align:center;">Verify Your Email</h2>

          <p style="color:#555; font-size:16px;">
            Use the OTP below to complete your verification. This code is valid for a limited time.
          </p>

          <div style="text-align:center; margin:30px 0;">
            <span style="
              display:inline-block;
              padding:12px 24px;
              font-size:22px;
              letter-spacing:4px;
              background:#000;
              color:#fff;
              border-radius:6px;
              font-weight:bold;
            ">
              ${otp}
            </span>
          </div>

          <p style="color:#777; font-size:14px;">
            If you did not request this, please ignore this email.
          </p>

          <p style="color:#aaa; font-size:12px; text-align:center; margin-top:40px;">
            © ${new Date().getFullYear()} Your App Name
          </p>

        </div>
      </body>
    </html>
  `;
};

export default htmlTemplate;
