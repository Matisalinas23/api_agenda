import { ValidationError } from "../errors/validationError"
import { ICreateNote } from "./note.interface"

export function validateCreateNote(dto: ICreateNote): void {
  if (!dto.title) {
    throw new ValidationError("Title is required")
  }

  if (!dto.assignature) {
    throw new ValidationError("Assignature is required")
  }

  if (!dto.color) {
    throw new ValidationError("Color is required")
  }

  if (!dto.limitDate) {
    throw new ValidationError("LimitDate is required")
  }
}