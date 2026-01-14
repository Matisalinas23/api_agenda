import { ConnectionError } from "../errors/connectionError";
import { notFoundError } from "../errors/notFoundError";
import { prisma } from "../lib/prisma";
import { ICreateNote } from "./note.interface";
import { validateCreateNote } from "./note.validation";

const getTextColor = (color: string) => {
    const darkColors = ["#E54444", "#F38A48", "#56EB83", "#5F62F2", "#AF78EA", "#E171E6", "#535353"];

    if (darkColors.includes(color)) {
        return "#ffffff"
    }

    return "#222222"
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
            }
        })
    } catch (error: any) {
        throw new ConnectionError("Failed to create note", error)
    }
}

export const updateNoteService = async (dto: ICreateNote, id: string) => {
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
            throw new notFoundError("Note not found")
        }

        throw new ConnectionError("Failed to update note", error)
    }
}

export const deleteNoteService = async (id: string) => {
    try {
        return await prisma.nota.delete({
            where: { id: Number(id) }
        })
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new notFoundError("Note not found")
        }

        throw new ConnectionError("Failed to delete note", error)
    }
}
