import { ValidationError } from "../../errors/validationError"
import { ICreateNote } from "./note.interface"

export function validateCreateNote(dto: ICreateNote): void {
  if (!dto.title) {
    throw new ValidationError("Title is required")
  }
  if (typeof dto.title !== "string") {
    throw new ValidationError("Tile must be a string")
  }
  if (dto.title.length <= 60) {
    throw new ValidationError("Tile must have 60 or less characters")
  }

  if (!dto.assignature) {
    throw new ValidationError("Assignature is required")
  }
  if (typeof dto.assignature !== "string") {
    throw new ValidationError("Assignature must be a string")
  }
  if (dto.assignature.length <= 30) {
    throw new ValidationError("Assignature must have 30 or less characters")
  }

  if (!dto.color) {
    throw new ValidationError("Color is required")
  }
  if (typeof dto.color !== "string") {
    throw new ValidationError("Color must be a string")
  }
  if (dto.color.length <= 10) {
    throw new ValidationError("Color must have 10 or less characters")
  }
  

  if (!dto.limitDate) {
    throw new ValidationError("LimitDate is required")
  }
  if (typeof dto.limitDate !== "string") {
    throw new ValidationError("LimitDate must be a string")
  }

  const date = new Date(dto.limitDate)

  if (isNaN(date.getTime())) {
    throw new ValidationError("LimitDate has an invalid format")
  }
}