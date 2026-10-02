import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  secure: (process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendWelcomeEmail({ name, email }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER y SMTP_PASS deben existir en el archivo .env");
  }

  const fullName = name || "Usuario";
  const destination = email || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"IUSH" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: destination,
    subject: "¡Bienvenido a IUSH!",
    html: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bienvenido</title>
        </head>
        <body style="margin:0; padding:0; background:linear-gradient(135deg, #f4f7fb 0%, #eaf1ff 100%); font-family:Arial, sans-serif;">
          <div style="max-width:620px; margin:40px auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 18px 50px rgba(32, 55, 88, 0.12);">
            <div style="padding:28px 32px 12px; background:linear-gradient(135deg, #1b2a41 0%, #294d8b 100%);">
              <div style="display:inline-block; background:rgba(255,255,255,0.12); color:#ffffff; padding:8px 14px; border-radius:999px; font-size:12px; letter-spacing:1px; font-weight:bold;">
                BIENVENIDO
              </div>
              <h1 style="margin:18px 0 8px; color:#ffffff; font-size:30px; line-height:1.25;">
                Hola, ${escapeHtml(fullName)} 
              </h1>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 16px; color:#3d4a5a; font-size:16px; line-height:1.7;">
                Gracias por unirte a nuestra comunidad. Estamos muy contentos de tenerte con nosotros.
              </p>

              <p style="margin:0 0 24px; color:#3d4a5a; font-size:16px; line-height:1.7;">
                Tu cuenta ya está lista para empezar a explorar todo lo que tenemos para ofrecerte.
              </p>

              <div style="text-align:center; margin:26px 0;">
                <a href="https://example.com" style="display:inline-block; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:12px; font-size:15px; font-weight:bold;">
                  Comenzar ahora
                </a>
              </div>

              <div style="background:#f7f9fc; border:1px solid #e5ebf5; border-radius:14px; padding:18px 20px; margin-top:20px;">
                <p style="margin:0; color:#475569; font-size:14px;">
                  <strong>Correo:</strong> ${escapeHtml(destination)}
                </p>
              </div>
            </div>

            <div style="padding:22px 32px 30px; background:#f5f7fb; border-top:1px solid #edf1f7; text-align:center;">
              <p style="margin:0; color:#64748b; font-size:13px;">
                Equipo IUSH • Gracias por confiar en nosotros
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info),
  };
}

export default transporter;
