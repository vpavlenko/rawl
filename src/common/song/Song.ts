import { observable, autorun, computed, action } from "mobx"
import { list, object, serializable } from "serializr"
import _ from "lodash"

import Track from "common/track"
import Measure, { getMeasuresFromConductorTrack } from "common/measure"
import { TIME_BASE } from "Constants"
import { isNotUndefined } from "../helpers/array"

const END_MARGIN = 480 * 30

export default class Song {
  @serializable(list(object(Track)))
  @observable.shallow
  tracks: Track[] = []

  @serializable
  @observable
  selectedTrackId: number = 0

  @serializable
  @observable
  filepath: string = ""

  name: string

  private _endOfSong: number = 0
  private _measures: Measure[] = []

  private _updateEndOfSong() {
    const eos = _.max(this.tracks.map(t => t.endOfTrack).filter(isNotUndefined))
    this._endOfSong = (eos !== undefined ? eos : 0) + END_MARGIN
    this._measures =
      this.conductorTrack !== undefined
        ? getMeasuresFromConductorTrack(this.conductorTrack)
        : []
  }

  // デシリアライズ時に呼ぶこと
  onDeserialized() {
    this._updateEndOfSong()
  }

  disposer: (() => void) | null = null

  @action addTrack(t: Track) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (t.channel === undefined && this.tracks.length > 0) {
      t.channel = t.channel || this.tracks.length - 1
    }
    this.tracks.push(t)
    this._updateEndOfSong()

    if (this.disposer) {
      this.disposer()
    }
    this.disposer = autorun(() => {
      this._updateEndOfSong()
    })
  }

  @action removeTrack(id: number) {
    _.pullAt(this.tracks, id)
    this.selectedTrackId = Math.min(id, this.tracks.length - 1)
    this._updateEndOfSong()
  }

  @action selectTrack(id: number) {
    if (id === this.selectedTrackId) {
      return
    }
    this.selectedTrackId = id
  }

  @computed get conductorTrack(): Track | undefined {
    return _.find(this.tracks, t => t.isConductorTrack)
  }

  @computed get selectedTrack(): Track | undefined {
    return this.tracks[this.selectedTrackId]
  }

  getTrack(id: number): Track {
    return this.tracks[id]
  }

  get measures(): Measure[] {
    return this._measures
  }

  get endOfSong(): number {
    return this._endOfSong
  }

  trackIdOfChannel(channel: number): number | undefined {
    const tracks = this.tracks
    const track = _.find(tracks, t => t.channel === channel)
    if (track) {
      return tracks.indexOf(track)
    }
    return undefined
  }
}
