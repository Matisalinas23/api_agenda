import { ConnectionError } from "../../errors/connectionError"
import { CustomError } from "../../errors/customError"
import { notFoundError } from "../../errors/notFoundError"
import { prisma } from "../../lib/prisma"
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
            throw new notFoundError("User not found")
        }

        return user
    } catch (error) {
        if (error instanceof CustomError) {
            throw error
        }

        throw new ConnectionError("Failed to get user", error)
    }
}