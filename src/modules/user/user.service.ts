import { prisma } from "../../lib/prisma"

export const getAllUsersService = async () => {
    return await prisma.user.findMany()
}