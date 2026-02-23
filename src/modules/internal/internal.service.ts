import { prisma } from "../../lib/prisma";
import { sendReminderEmail } from "../../services/email.service";


export const runDueDateRemindersService = async () => {
    const today = new Date();
    
    const start = new Date();
    start.setDate(today.getDate() + 3);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const notes = await prisma.nota.findMany({
        where: {
            limitDate: {
                gte: start,
                lt: end,
            },
        },
        include: {
            user: true,
        }
    });

    for (const note of notes) {
        await sendReminderEmail(note.user.email, note.title, note.limitDate);

        await prisma.nota.update({
            where: { id: note.id },
            data: { reminderSent: true },
        })
    }

}