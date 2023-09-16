import { QueryDocumentSnapshot } from "@firebase/firestore"
import { orderBy } from "lodash"
import { computed, makeObservable, observable } from "mobx"
import {
  FirestoreSong,
  deleteSong,
  getCurrentUserSongs,
} from "../../firebase/song"
import RootStore from "./RootStore"

export class CloudFileStore {
  isLoading = false
  selectedColumn: "name" | "date" = "date"
  dateType: "created" | "updated" = "created"
  sortAscending = false
  _files: QueryDocumentSnapshot<FirestoreSong>[] = []

  constructor(private readonly rootStore: RootStore) {
    makeObservable(this, {
      isLoading: observable,
      selectedColumn: observable,
      dateType: observable,
      sortAscending: observable,
      _files: observable,
      files: computed,
    })
  }

  async load() {
    this.isLoading = true
    const snapshot = await getCurrentUserSongs()
    this._files = snapshot.docs
    this.isLoading = false
  }

  get files() {
    return orderBy(
      this._files,
      (f) => {
        const data = f.data()
        switch (this.selectedColumn) {
          case "name":
            return data.name
          case "date":
            switch (this.dateType) {
              case "created":
                return data.createdAt.seconds
              case "updated":
                return data.updatedAt.seconds
            }
        }
      },
      this.sortAscending ? "asc" : "desc",
    )
  }

  async deleteSong(song: QueryDocumentSnapshot<FirestoreSong>) {
    await deleteSong(song)
    if (this.rootStore.song.firestoreReference?.id === song.id) {
      this.rootStore.song.firestoreReference = null
      this.rootStore.song.firestoreDataReference = null
    }
    await this.load()
  }
}
