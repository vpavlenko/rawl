import { makeObservable, observable } from "mobx"
import { TrackEvent } from "../../common/track"

export default class RootViewStore {
  isArrangeViewSelected: boolean = false
  openDrawer = false
  openHelp = false
  openDeviceDialog = false
  openEventEditor = false
  eventEditorEvents: TrackEvent[] = []

  constructor() {
    makeObservable(this, {
      isArrangeViewSelected: observable,
      openDrawer: observable,
      openHelp: observable,
      openDeviceDialog: observable,
      openEventEditor: observable,
      eventEditorEvents: observable.shallow,
    })
  }
}
