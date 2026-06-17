import { ObjectId } from 'mongodb'

export type UserDbModel = {
  _id: ObjectId
  login: string
  email: string
  passwordHash: string
  createdAt: string
  emailConfirmation: {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean

    recoveryCode?: string | null
    recoveryCodeExpirationDate?: Date | null
  }
}