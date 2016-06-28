class Song {
  constructor() {
    this.tracks = []
  }

  addTrack(t) {
    this.tracks.push(t)
  }

  getTracks() {
    return this.tracks
  }

  getTrack(id) {
    return this.tracks[id]
  }

  static fromMidi(midi) {
    const song = new Song
    midi.tracks.forEach(t => {
      const track = new Track
      t.events.forEach(e => {
        track.addEvent(e)
      })
      song.addTrack(track)
    })
    return song
  }
}

class Track {
  constructor() {
    this.events = []
    this.lastEventId = 0
  }

  getMeta() {

  }

  getEvents() {

  }

  getEventById(id) {

  }

  updateEvent(id, obj) {

  }

  removeEvent(id) {

  }

  addEvent(e) {
    e.id = this.lastEventId
    this.events.push(e)
    this.lastEventId++
  }
}