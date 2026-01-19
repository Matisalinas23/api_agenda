import { ValidationError } from "../../errors/validationError"
import { ICreateNote } from "./note.interface"

export function validateCreateNote(noteValues: ICreateNote): void {
  const { title, assignature, color, description, limitDate } = noteValues


  if (!title) {
    throw new ValidationError("Title is required")
  }
  if (typeof title !== "string") {
    throw new ValidationError("Tile must be a string")
  }
  if (title.length > 60) {
    throw new ValidationError("Tile must have 60 or less characters")
  }

  if (!assignature) {
    throw new ValidationError("Assignature is required")
  }
  if (typeof assignature !== "string") {
    throw new ValidationError("Assignature must be a string")
  }
  if (assignature.length > 30) {
    throw new ValidationError("Assignature must have 30 or less characters")
  }

  if (description) {
    if (typeof description !== "string") {
      throw new ValidationError("Assignature must be a string")
    }
    if (description.length > 180) {
      throw new ValidationError("Assignature must have 180 or less characters")
    }
  }

  if (!color) {
    throw new ValidationError("Color is required")
  }
  if (typeof color !== "string") {
    throw new ValidationError("Color must be a string")
  }
  if (color.length > 10) {
    throw new ValidationError("Color must have 10 or less characters")
  }
  

  if (!limitDate) {
    throw new ValidationError("LimitDate is required")
  }
  if (typeof limitDate !== "string") {
    throw new ValidationError("LimitDate must be a string")
  }

  const date = new Date(limitDate)

  if (isNaN(date.getTime())) {
    throw new ValidationError("LimitDate has an invalid format")
  }
}