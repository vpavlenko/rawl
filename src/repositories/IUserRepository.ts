export interface User {
  id: string
  name: string
  bio: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  uid: string
  photoURL: string | null
  displayName: string | null
}

export interface IUserRepository {
  create(data: Pick<User, "name" | "bio">): Promise<void>
  update(data: Pick<User, "name" | "bio">): Promise<void>
  getCurrentUser(): Promise<User | null>
  get(id: string): Promise<User | null>
  getByUsername(username: string): Promise<User | null>
  observeCurrentUser(callback: (user: User | null) => void): () => void
  observeAuthUser(callback: (user: AuthUser | null) => void): () => void
}
