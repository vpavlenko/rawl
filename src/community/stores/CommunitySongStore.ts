import { QueryDocumentSnapshot } from "@firebase/firestore"
import { makeObservable, observable } from "mobx"
import { FirestoreSong, getCurrentUserSongs } from "../../firebase/song"

export class CommunitySongStore {
  isLoading = false
  songs: QueryDocumentSnapshot<FirestoreSong>[] = []

  constructor() {
    makeObservable(this, {
      isLoading: observable,
      songs: observable,
    })
  }

  async load() {
    this.isLoading = true
    const snapshot = await getCurrentUserSongs()
    this.songs = snapshot.docs
    this.isLoading = false
  }
}
