export interface User {
  id: string
  name: string
  photoURL: string
  bio: string
  createdAt: Date
  updatedAt: Date
}

export interface IUserRepository {
  getCurrentUser(): Promise<User>
}
