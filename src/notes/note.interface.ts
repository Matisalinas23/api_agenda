export interface ICreateNote {
    title: string
    assignature: string
    color: string
    limitDate: Date
    description?: string | null
}

export interface INote extends ICreateNote {
    id: number
    textColor: string
    createdAt: Date
}