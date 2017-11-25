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
      if (player.loopEnd !== null) {
        tick = Math.min(player.loopEnd, tick)
      }
      player.loopBegin = tick
      playerStore.loopBegin = tick
    },
    "SET_LOOP_END": ({ tick }) => {
      tick = quantizer.round(tick)
      if (player.loopBegin !== null) {
        tick = Math.max(player.loopBegin, tick)
      }
      player.loopEnd = tick
      playerStore.loopEnd = tick
    }
  }
}
