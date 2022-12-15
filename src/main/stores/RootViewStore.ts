import { makeObservable, observable } from "mobx"
import { TrackEvent } from "../../common/track"

export default class RootViewStore {
  isArrangeViewSelected: boolean = false
  openDrawer = false
  openHelp = false
  eventEditorEvents: TrackEvent[] = []
  openSignInDialog = false
  openCloudFileDialog = false
  openSettingDialog = false

  constructor() {
    makeObservable(this, {
      isArrangeViewSelected: observable,
      openDrawer: observable,
      openHelp: observable,
      eventEditorEvents: observable.shallow,
      openSignInDialog: observable,
      openCloudFileDialog: observable,
      openSettingDialog: observable,
    })
  }
}
