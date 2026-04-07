import { prisma } from "../../lib/prisma";
import { sendReminderEmail } from "../../services/email.service";


export const runDueDateRemindersService = async () => {
    const today = new Date();

    const getDayRange = (days: number) => {
        const start = new Date();
        start.setDate(today.getDate() + days);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { gte: start, lt: end };
    };

    // 1-Day Reminders
    const range1 = getDayRange(1);
    const notes1Day = await prisma.nota.findMany({
        where: {
            limitDate: range1,
            reminder1DaySent: false,
        },
        include: { user: true }
    });

    for (const note of notes1Day) {
        await sendReminderEmail(note.user.email, note.title, note.limitDate, 1);
        await prisma.nota.update({
            where: { id: note.id },
            data: { reminder1DaySent: true },
        });
    }

    // 3-Day Reminders
    const range3 = getDayRange(3);
    const notes3Day = await prisma.nota.findMany({
        where: {
            limitDate: range3,
            reminder3DaySent: false,
        },
        include: { user: true }
    });

    for (const note of notes3Day) {
        await sendReminderEmail(note.user.email, note.title, note.limitDate, 3);
        await prisma.nota.update({
            where: { id: note.id },
            data: { reminder3DaySent: true },
        });
    }
}