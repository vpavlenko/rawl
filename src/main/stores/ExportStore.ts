import { makeObservable, observable } from "mobx"
import { SongStore } from "./SongStore"

export class ExportStore {
  openExportDialog = false
  openExportProgressDialog = false
  progress = 0
  rendererWorker: Worker | null = null
  private readonly rootStore: SongStore

  constructor(rootStore: SongStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      openExportDialog: observable,
      openExportProgressDialog: observable,
      progress: observable,
    })
  }
}
