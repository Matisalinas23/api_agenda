import { DatabaseError } from "../../errors/databaseError";
import { notFoundError } from "../../errors/notFoundError";
import { prisma } from "../../lib/prisma";
import { ICreateNote, INote } from "./note.interface";
import { validateCreateNote } from "./note.validation";

const getTextColor = (color: string) => {
    const darkColors = ["#FF8989", "#FFAA74", "#8CADFE", "#C79EF3", "#E7A1EA", "#6B6B6B"];

    if (darkColors.includes(color)) {
        return "#333333"
    }

    return "#333333"
}

export const getAllNotesService = async () => {
    return prisma.nota.findMany()
}

export const createNoteServie = async (dto: ICreateNote) => {
    validateCreateNote(dto)
    
    try {
        const textColor = getTextColor(dto.color)

        return prisma.nota.create({
            data: {
                title: dto.title,
                assignature: dto.assignature,
                color: dto.color,
                textColor: textColor,
                limitDate: dto.limitDate,
                description: dto.description,
            },
            include: {
                user: true
            }
        })
    } catch (error: any) {
        throw new DatabaseError("Failed to create note")
    }
}

export const updateNoteService = async (dto: ICreateNote, id: string | string[]) => {
    const textColor = getTextColor(dto.color)

    try {
        return await prisma.nota.update({
            where: { id: Number(id) },
            data: {
                title: dto.title,
                assignature: dto.assignature,
                color: dto.color,
                textColor,
                description: dto.description,
                limitDate: dto.limitDate
            }
        })
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new notFoundError("Note was not found")
        }

        throw new DatabaseError("Failed to update note")
    }
}

export const deleteNoteService = async (id: string | string[]) => {
    try {
        return await prisma.nota.delete({
            where: { id: Number(id) }
        })
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new notFoundError("Note not found")
        }

        throw new DatabaseError("Failed delete note")
    }
}

export const orderNoteByAssignatureService = async () => {
    try {
        return await prisma.nota.findMany({
            orderBy: {
                assignature: "asc"
            }
        })
    } catch (error) {
        throw new DatabaseError("Failed to order note by assignature")
    }
}

export const orderNotesByDateService = async () => {
    try {
        return await prisma.nota.findMany({
            orderBy: {
                limitDate: "asc"
            }
        })
    } catch (error) {
        throw new DatabaseError("Failed to order by date")
    }
}
