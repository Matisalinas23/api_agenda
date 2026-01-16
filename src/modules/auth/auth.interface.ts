export interface ILogin {
    email: string
    password: string
}

export interface IJwtPayload {
  userId: number
  email: string
}