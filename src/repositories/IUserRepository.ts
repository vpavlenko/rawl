export interface User {
  id: string
  name: string
  photoURL: string
  bio: string
  createdAt: Date
  updatedAt: Date
}

export interface IUserRepository {
  create(data: Pick<User, "name" | "photoURL" | "bio">): Promise<void>
  update(data: Pick<User, "name" | "photoURL" | "bio">): Promise<void>
  getCurrentUser(): Promise<User>
}
