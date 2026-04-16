import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendVerificationEmail = async (email: string, token: string) => {
    if (process.env.NODE_ENV === "test") return;

    try {
        console.log(`Sending verification email to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verifica tu cuenta",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2>Bienvenido a Agenda Web</h2>
                    <p>Introduce el siguiente código de confirmación para verificar tu cuenta:</p>
                    <div style="background: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
                        ${token}
                    </div>
                    <p>Este código expirará en 10 minutos.</p>
                </div>
            `,
        });
        console.log("Verification email sent successfully!");
    } catch (error: any) {
        console.error("Error sending verification email:", error);
        throw new Error("No se pudo enviar el correo de verificación.");
    }
}

export const sendReminderEmail = async (email: string, title: string, dueDate: Date, daysLeft: number) => {
    try {
        const message = daysLeft === 1 ? "Queda solo 1 día." : `Quedan solo ${daysLeft} días.`;
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "¡La fecha de tu nota se acerca!",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h1>Recordatorio</h1>
                    <p>Tu nota "<strong>${title}</strong>" vence el ${dueDate.toDateString()}</p>
                    <p>${message}</p>
                </div>
            `
        });
    } catch (error: any) {
        console.error("Error sending reminder email:", error);
    }
}

export const sendResetPasswordEmail = async (email: string, token: string) => {
    if (process.env.NODE_ENV === "test") return;

    const baseUrl = process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL_WEB 
        : process.env.FRONTEND_URL_LOCAL;
    
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
        console.log(`Sending password reset email to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Restablece tu contraseña",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2>Restablecer contraseña</h2>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">
                            Restablecer mi contraseña
                        </a>
                    </div>
                    <p>Si el botón no funciona, puedes copiar y pega el siguiente enlace en tu navegador:</p>
                    <p>${resetUrl}</p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
                </div>
            `,
        });
        console.log("Password reset email sent successfully!");
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        throw new Error("No se pudo enviar el correo de restablecimiento de contraseña.");
    }
}
