export default ({ services: { player, quantizer }, song }) => {
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
    }
  }
}
