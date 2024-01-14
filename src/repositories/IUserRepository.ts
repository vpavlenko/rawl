export interface User {
  id: string
  name: string
  bio: string
  createdAt: Date
  updatedAt: Date
}

export interface IUserRepository {
  create(data: Pick<User, "name" | "bio">): Promise<void>
  update(data: Pick<User, "name" | "bio">): Promise<void>
  getCurrentUser(): Promise<User | null>
}
