import { QueryDocumentSnapshot } from "@firebase/firestore"
import { orderBy } from "lodash"
import { computed, makeObservable, observable } from "mobx"
import { FirestoreSong, getSongs } from "../firebase/song"

export class CloudFileStore {
  isLoading = false
  selectedColumn: "name" | "date" = "date"
  dateType: "created" | "updated" = "created"
  sortAscending = false
  _files: QueryDocumentSnapshot<FirestoreSong>[] = []

  constructor() {
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
    const snapshot = await getSongs()
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
      this.sortAscending ? "asc" : "desc"
    )
  }
}
