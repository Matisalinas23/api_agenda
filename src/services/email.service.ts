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

/**
 * Helper to generate a consistent, centered and responsive HTML email template.
 */
const getEmailTemplate = (title: string, content: string, cta?: { text: string; url: string }, footer?: string) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f4f4f4;">
                <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">Agenda</h1>
            </div>
            <div style="padding: 10px 20px;">
                <h2 style="color: #444; margin-top: 0; text-align: center; font-size: 22px;">${title}</h2>
                <div style="margin-bottom: 25px; text-align: center; font-size: 16px; color: #555;">
                    ${content}
                </div>
                ${cta ? `
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${cta.url}" style="background-color: #4CAF50; color: white; padding: 14px 30px; text-align: center; text-decoration: none; display: inline-block; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        ${cta.text}
                    </a>
                </div>
                <p style="font-size: 13px; color: #888; text-align: center; margin-top: 25px; line-height: 1.4;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <a href="${cta.url}" style="color: #4CAF50; word-break: break-all;">${cta.url}</a>
                </p>
                ` : ''}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <div style="text-align: center; font-size: 12px; color: #999; line-height: 1.5;">
                <p>${footer || 'Si no has solicitado esto, puedes ignorar este correo con seguridad.'}</p>
                <p>&copy; ${new Date().getFullYear()} Agenda Universitaria</p>
            </div>
        </div>
    `;
};

export const sendVerificationEmail = async (email: string, token: string) => {
    if (process.env.NODE_ENV === "test") return;

    try {
        console.log(`Sending verification email to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verifica tu cuenta",
            html: getEmailTemplate(
                "¡Bienvenido a Agenda!",
                `Gracias por registrarte. Para verificar tu cuenta, por favor introduce el siguiente código de confirmación:<br><br>
                <div style="background: #f4f4f4; padding: 15px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #4CAF50; border-radius: 8px; margin: 20px 0;">
                    ${token}
                </div>
                Este código expirará en 10 minutos.`,
                undefined,
                "Si no has creado esta cuenta, ignora este mensaje."
            ),
        });
        console.log("Verification email sent successfully!");
    } catch (error: any) {
        console.error("Error sending verification email:", error);
        throw new Error("No se pudo enviar el correo de verificación.");
    }
}

export const sendReminderEmail = async (email: string, title: string, dueDate: Date, daysLeft: number) => {
    if (process.env.NODE_ENV === "test") return;

    try {
        const message = daysLeft === 1 ? "Queda solo 1 día." : `Quedan solo ${daysLeft} días.`;
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "¡La fecha de tu nota se acerca!",
            html: getEmailTemplate(
                "Recordatorio de Tarea",
                `Te recordamos que tu nota "<strong>${title}</strong>" vence pronto.<br><br>
                <strong>Fecha límite:</strong> ${dueDate.toLocaleDateString()}<br>
                <strong>Estado:</strong> ${message}`,
                undefined,
                "Este es un recordatorio automático de tu agenda universitaria."
            )
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
            html: getEmailTemplate(
                "Restablecer contraseña",
                "Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para elegir una nueva. Este enlace expirará en 1 hora.",
                { text: "Restablecer mi contraseña", url: resetUrl }
            ),
        });
        console.log("Password reset email sent successfully!");
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        throw new Error("No se pudo enviar el correo de restablecimiento de contraseña.");
    }
}

export const sendDeleteAccountEmail = async (email: string, token: string) => {
    if (process.env.NODE_ENV === "test") return;

    const baseUrl = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_WEB
        : process.env.FRONTEND_URL_LOCAL;

    const deleteUrl = `${baseUrl}/delete-account?token=${token}`;

    try {
        console.log(`Sending account deletion confirmation link to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Eliminar cuenta",
            html: getEmailTemplate(
                "Eliminar cuenta",
                "Has solicitado eliminar tu cuenta de Agenda. Esta acción borrará permanentemente todos tus datos universitarios.<br><br>Si estás seguro, haz clic en el botón de abajo. El enlace expirará en 1 hora.",
                { text: "Confirmar eliminación", url: deleteUrl }
            ),
        });
        console.log("Account deletion email sent successfully!");
    } catch (error: any) {
        console.error("Error sending account deletion email:", error);
        throw new Error("No se pudo enviar el correo de eliminación de cuenta.");
    }
}

export const sendAccountDeactivationEmail = async (email: string, reactivationToken: string) => {
    if (process.env.NODE_ENV === "test") return;

    const baseUrl = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_WEB
        : process.env.FRONTEND_URL_LOCAL;

    const reactivationUrl = `${baseUrl}/reactivate-account?token=${reactivationToken}`;

    try {
        console.log(`Sending account deactivation notice to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Tu cuenta será eliminada en 5 días",
            html: getEmailTemplate(
                "Cuenta inhabilitada temporalmente",
                "Hemos procesado tu solicitud de eliminación. Tu cuenta ha sido inhabilitada y <strong>se eliminará permanentemente en 5 días</strong>.<br><br>Si cambias de opinión, puedes recuperar tu cuenta y todos tus datos haciendo clic en el botón de abajo antes de que expire el plazo.",
                { text: "Rehabilitar mi cuenta", url: reactivationUrl },
                "Si no has solicitado esto, rehabilita tu cuenta inmediatamente y cambia tu contraseña."
            ),
        });
        console.log("Account deactivation email sent successfully!");
    } catch (error: any) {
        console.error("Error sending account deactivation email:", error);
        throw new Error("No se pudo enviar el correo de aviso de inhabilitación.");
    }
}

export const sendYourAccountWasDeletedEmail = async (email: string) => {
    if (process.env.NODE_ENV === "test") return;

    const baseUrl = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_WEB
        : process.env.FRONTEND_URL_LOCAL;
    
    try {
        console.log(`Sending final account deletion confirmation to: ${email}...`);
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Su cuenta ha sido eliminada permanentemente",
            html: getEmailTemplate(
                "Cuenta eliminada con éxito",
                "Te comunicamos que el proceso de eliminación de tu cuenta ha concluido de manera permanente.<br><br>Toda tu información ha sido borrada de nuestros sistemas.",
                { text: "Volver a la web", url: `${baseUrl}/login` },
                "Gracias por haber formado parte de Agenda. Esperamos volver a verte."
            ),
        })
        console.log("Account deletion confirmation email sent successfully!");
    } catch (error: any) {
        console.error("Error sending account deletion confirmation email:", error);
        throw new Error("No se pudo enviar el correo de confirmación de eliminación.");
    }
}
