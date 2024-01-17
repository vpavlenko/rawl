import { Auth, User as AuthUser } from "firebase/auth"
import { makeObservable, observable } from "mobx"
import { IUserRepository, User } from "../../repositories/IUserRepository"

export class AuthStore {
  authUser: AuthUser | null = null
  user: User | null = null

  constructor(
    auth: Auth,
    private readonly userRepository: IUserRepository,
  ) {
    makeObservable(this, {
      authUser: observable,
      user: observable,
    })

    let subscribe: (() => void) | null = null

    auth.onAuthStateChanged(async (user) => {
      this.authUser = user

      subscribe?.()

      if (user !== null) {
        subscribe = userRepository.observeCurrentUser((user) => {
          this.user = user
        })
        await this.createProfileIfNeeded(user)
      }
    })
  }

  private async createProfileIfNeeded(authUser: AuthUser) {
    // Create user profile if not exists
    const user = await this.userRepository.getCurrentUser()
    if (user === null) {
      const newUserData = {
        name: authUser.displayName ?? "",
        bio: "",
      }
      await this.userRepository.create(newUserData)
    }
  }
}
