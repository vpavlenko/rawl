import Color from "color"
import { vec4 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { trackColorToVec4 } from "../../../../common/track/TrackColor"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { NoteCircles } from "./NoteCircles"
import { NoteRectangles } from "./NoteRectangles"

export const GhostNotes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    song,
    pianoRollStore: { ghostNotes: notesByTrack },
  } = useStores()
  const theme = useTheme()
  const ghostNoteColor = colorToVec4(Color(theme.ghostNoteColor))
  const transparentColor = vec4.zero(vec4.create())

  return Object.keys(notesByTrack).map((key) => {
    const trackId = parseInt(key)
    const notes = notesByTrack[trackId]
    const track = song.tracks[trackId]
    const trackColor =
      track.color !== undefined ? trackColorToVec4(track.color) : null
    const ghostedColor =
      trackColor !== null
        ? vec4.lerp(vec4.create(), trackColor, ghostNoteColor, 0.7)
        : ghostNoteColor

    if (track.isRhythmTrack) {
      return (
        <NoteCircles
          strokeColor={transparentColor}
          rects={notes}
          inactiveColor={transparentColor}
          activeColor={ghostedColor}
          selectedColor={ghostedColor} // TODO: velocity を使わないシェーダを書く
          zIndex={zIndex}
        />
      )
    }
    return (
      <NoteRectangles
        rects={notes}
        strokeColor={transparentColor}
        inactiveColor={transparentColor}
        activeColor={ghostedColor}
        selectedColor={ghostedColor} // TODO: velocity を使わないシェーダを書く
        zIndex={zIndex + 0.1}
      />
    )
  })
})
