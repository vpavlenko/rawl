import RootStore from "../stores/RootStore"

export const play = (rootStore: RootStore) => () => {
  const {
    services: { player },
    song,
  } = rootStore
  if (player.isPlaying) {
    player.stop()
  } else {
    player.play(song)
  }
}

export const stop = (rootStore: RootStore) => () => {
  const {
    services: { player },
  } = rootStore
  if (player.isPlaying) {
    player.stop()
  } else {
    player.stop()
    player.position = 0
  }
}

export const setPlayerPosition = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  player.position = quantizer.round(tick)
}

export const movePlayerPosition = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  player.position = quantizer.round(player.position + tick)
}

export const previewNote = (rootStore: RootStore) => (
  channel: number,
  noteNumber: number
) => {
  const {
    services: { player },
  } = rootStore
  player.playNote({
    channel: channel,
    noteNumber: noteNumber,
    velocity: 100,
    duration: 128,
  })
}

export const setLoopBegin = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  tick = quantizer.round(tick)
  if (player.loop.end !== null) {
    tick = Math.min(player.loop.end, tick)
  }
  player.loop = { ...player.loop, begin: tick }
}

export const setLoopEnd = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  tick = quantizer.round(tick)
  if (player.loop.begin !== null) {
    tick = Math.max(player.loop.begin, tick)
  }
  player.loop = { ...player.loop, end: tick }
}

export const toggleEnableLoop = (rootStore: RootStore) => () => {
  const {
    services: { player },
  } = rootStore
  player.loop = { ...player.loop, enabled: !player.loop.enabled }
}
