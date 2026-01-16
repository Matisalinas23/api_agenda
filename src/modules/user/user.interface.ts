export interface ICreateUser {
    email: string
    username: string
    password: string
}

export interface IUser extends ICreateUser {
    id: number
    createdAt: Date
}