import { makeObservable, observable } from "mobx"
import { TrackEvent } from "../../common/track"

export default class RootViewStore {
  isArrangeViewSelected: boolean = false
  openDrawer = false
  openTrackListDrawer = false
  openHelp = false
  openDeviceDialog = false
  openEventEditor = false
  eventEditorEvents: TrackEvent[] = []
  openSignInDialog = false
  openCloudFileDialog = false

  constructor() {
    makeObservable(this, {
      isArrangeViewSelected: observable,
      openDrawer: observable,
      openTrackListDrawer: observable,
      openHelp: observable,
      openDeviceDialog: observable,
      openEventEditor: observable,
      eventEditorEvents: observable.shallow,
      openSignInDialog: observable,
      openCloudFileDialog: observable,
    })
  }
}
