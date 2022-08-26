import { User } from "firebase/auth"
import { makeObservable, observable } from "mobx"
import { auth } from "../../firebase/firebase"

export class AuthStore {
  user: User | null = null

  constructor() {
    makeObservable(this, {
      user: observable,
    })

    auth.onAuthStateChanged((user) => {
      this.user = user
    })
  }
}
