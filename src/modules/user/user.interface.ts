import { INote } from "../notes/note.interface"

export interface ICreateUser {
    email: string
    username: string
    password: string
}

export interface IUser extends ICreateUser {
    id: number
    createdAt: Date
    notes: INote[]
}