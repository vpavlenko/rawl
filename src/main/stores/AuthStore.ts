import { User as AuthUser } from "firebase/auth"
import { makeObservable, observable } from "mobx"
import { auth } from "../../firebase/firebase"

export class AuthStore {
  authUser: AuthUser | null = null

  constructor() {
    makeObservable(this, {
      authUser: observable,
    })

    auth.onAuthStateChanged((user) => {
      this.authUser = user
    })
  }
}
