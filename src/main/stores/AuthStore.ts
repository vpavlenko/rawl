import { Auth, User as AuthUser } from "firebase/auth"
import { makeObservable, observable } from "mobx"
import { IUserRepository, User } from "../../repositories/IUserRepository"

export class AuthStore {
  authUser: AuthUser | null = null
  user: User | null = null

  constructor(auth: Auth, userRepository: IUserRepository) {
    makeObservable(this, {
      authUser: observable,
      user: observable,
    })

    let subscribe: (() => void) | null = null

    auth.onAuthStateChanged((user) => {
      this.authUser = user

      subscribe?.()

      if (user !== null) {
        subscribe = userRepository.observeCurrentUser((user) => {
          this.user = user
        })
      }
    })
  }
}
