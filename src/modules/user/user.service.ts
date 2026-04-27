import { CustomError } from "../../errors/customError"
import { DatabaseError } from "../../errors/databaseError"
import { NotFoundError } from "../../errors/notFoundError"
import { prisma } from "../../lib/prisma"
import { sendYourAccountWasDeletedEmail } from "../../services/email.service"
import { validateUserId } from "./user.validation"

export const getAllUsersService = async () => {
    return await prisma.user.findMany()
}

export const getUserService = async (id: unknown) => {
    validateUserId(id)

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: { notes: true }
        })
    
        if (!user) {
            throw new NotFoundError("User not found")
        }

        return user
    } catch (error) {
        if (error instanceof CustomError) {
            throw error
        }

        throw new DatabaseError("Failed to get user")
    }
}

/**
 * Permanently deletes accounts that have exceeded their 5-day grace period.
 * This should be called by a scheduled cron job.
 */
export const cleanupExpiredAccountsService = async () => {
    const now = new Date();
    
    console.log("[Cleanup Task] Checking for expired accounts...");

    const expiredUsers = await prisma.user.findMany({
        where: {
            deleteAfter: {
                lte: now
            }
        },
        select: {
            id: true,
            email: true
        }
    });

    if (expiredUsers.length === 0) {
        console.log("[Cleanup Task] No expired accounts found.");
        return { deletedCount: 0 };
    }

    console.log(`[Cleanup Task] Found ${expiredUsers.length} accounts to delete.`);

    for (const user of expiredUsers) {
        try {
            // Enviar email de confirmación final
            await sendYourAccountWasDeletedEmail(user.email);
            
            // Borrado físico (Cascade eliminará todo lo relacionado)
            await prisma.user.delete({
                where: { id: user.id }
            });
            console.log(`[Cleanup Task] User ${user.email} permanently deleted.`);
        } catch (error) {
            console.error(`[Cleanup Task] Failed to delete user ${user.email}:`, error);
        }
    }

    return { deletedCount: expiredUsers.length };
}