import { QueryDocumentSnapshot } from "@firebase/firestore"
import { makeObservable, observable } from "mobx"
import { getPublicSongs } from "../../firebase/feed"
import { FirestoreSong } from "../../firebase/song"

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
    const snapshot = await getPublicSongs()
    this.songs = snapshot.docs
    this.isLoading = false
  }
}
