import React, { SFC, useEffect } from "react"
import { NoteCoordTransform } from "common/transform"
import { useObserver } from "mobx-react"
import { withSize } from "react-sizeme"
import { PianoRoll } from "components/PianoRoll/PianoRoll"
import { useTheme } from "main/hooks/useTheme"
import { useStores } from "main/hooks/useStores"
import { ISize } from "common/geometry"

export interface PianoRollWrapperProps {
  size: ISize
}

const PianoRollWrapper: SFC<PianoRollWrapperProps> = ({ size }) => {
  const { rootStore } = useStores()
  const {
    endTick,
    isPlaying,
    playerPosition,
    scaleX,
    scrollLeft,
    scrollTop,
    autoScroll,
    s,
  } = useObserver(() => ({
    endTick: rootStore.song.endOfSong,
    isPlaying: rootStore.services.player.isPlaying,
    playerPosition: rootStore.playerStore.position,
    s: rootStore.pianoRollStore,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    scrollTop: rootStore.pianoRollStore.scrollTop,
    autoScroll: rootStore.pianoRollStore.autoScroll,
  }))

  const theme = useTheme()
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const x = transform.getX(playerPosition)
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        s.scrollLeft = x
      }
    }
  }, [autoScroll, isPlaying, scaleX, scrollLeft, playerPosition])

  return (
    <PianoRoll
      size={size}
      endTick={endTick}
      scrollLeft={scrollLeft}
      setScrollLeft={(v) => (s.scrollLeft = v)}
      transform={transform}
      scrollTop={scrollTop}
      setScrollTop={(v) => (s.scrollTop = v)}
      onClickScaleUp={() => (s.scaleX = scaleX + 0.1)}
      onClickScaleDown={() => (s.scaleX = Math.max(0.05, scaleX - 0.1))}
      onClickScaleReset={() => (s.scaleX = 1)}
    />
  )
}

export default withSize({ monitorHeight: true })(PianoRollWrapper)
