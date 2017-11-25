export default ({ playerStore, services: { player, quantizer }, song }) => {
  return {
    "PLAY": () => {
      player.play(song)
    },
    "STOP": () => {
      if (player.isPlaying) {
        player.stop()
      } else {
        player.stop()
        player.position = 0
      }
    },
    "SET_PLAYER_POSITION": ({ tick }) => {
      player.position = quantizer.round(tick)
    },
    "MOVE_PLAYER_POSITION": ({ tick }) => {
      player.position = quantizer.round(player.position + tick)
    },
    "PREVIEW_NOTE": ({ noteNumber, channel }) => {
      player.playNote({ channel, noteNumber, velocity: 100, duration: 128 })
    },
    "SET_LOOP_BEGIN": ({ tick }) => {
      tick = quantizer.round(tick)
      if (player.loop.end !== null) {
        tick = Math.min(player.loop.end, tick)
      }
      player.loop.begin = tick
      playerStore.loop = { ...player.loop }
    },
    "SET_LOOP_END": ({ tick }) => {
      tick = quantizer.round(tick)
      if (player.loop.begin !== null) {
        tick = Math.max(player.loop.begin, tick)
      }
      player.loop.end = tick
      playerStore.loop = { ...player.loop }
    },
    "TOGGLE_ENABLE_LOOP": () => {
      player.loop.enabled = !player.loop.enabled
      playerStore.loop = { ...player.loop }
    }
  }
}
