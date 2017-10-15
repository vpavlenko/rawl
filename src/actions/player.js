export default ({ services: { player, quantizer } }) => {
  return {
    "PLAY": () => {
      player.play()
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
