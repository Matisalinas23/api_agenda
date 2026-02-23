import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {

    const { error } = await resend.emails.send({
        from: "Agenda <onboarding@resend.dev>",
        to: email,
        subject: "Verifica tu cuenta",
        html: `
            <h2>Bienvenido a Agenda Web</h2>
            <p>Introduce el siguiente código de confirmación para verificar tu cuenta</p>
            <p>${token}</p>
            <p>Este código expirará en 10 minutos</p>
        `,
    });

    if (error) {
        console.log(error)
        throw new Error(error.message);
    }
}

export const sendReminderEmail = async (email: string,title: string,dueDate: Date) => {
  await resend.emails.send({
    from: "Agenda <onboarding@resend.dev>",
    to: email,
    subject: "¡La fecha de tu nota se acerca!",
    html: `
      <h1>Recordatorio</h1>
      <p>Tu nota "${title}" vence el ${dueDate.toDateString()}</p>
      <p>Quedan solo 3 días.</p>
    `
  })
}
