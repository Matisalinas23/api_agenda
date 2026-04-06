import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
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

export const sendReminderEmail = async (email: string, title: string, dueDate: Date) => {
    try {
        await transporter.sendMail({
            from: `"Agenda" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "¡La fecha de tu nota se acerca!",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h1>Recordatorio</h1>
                    <p>Tu nota "<strong>${title}</strong>" vence el ${dueDate.toDateString()}</p>
                    <p>Quedan solo 3 días.</p>
                </div>
            `
        });
    } catch (error: any) {
        console.error("Error sending reminder email:", error);
    }
}
