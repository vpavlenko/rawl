import Color from "color"
import { vec4 } from "gl-matrix"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { trackColorToVec4 } from "../../../../common/track/TrackColor"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import { NoteCircles } from "./NoteCircles"
import { NoteRectangles } from "./NoteRectangles"

export const GhostNotes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    song,
    pianoRollStore: { ghostNotes: notes },
  } = useStores()
  const theme = useTheme()

  const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
  const colorForTrackId = song.tracks.map((t) =>
    t.color !== undefined ? trackColorToVec4(t.color) : null,
  )
  const ghostNoteColor = colorToVec4(Color(theme.ghostNoteColor))

  const getColorForTrackId = (trackId: number) => {
    const color = colorForTrackId[trackId] ?? ghostNoteColor
    return vec4.lerp(vec4.create(), color, ghostNoteColor, 0.7)
  }
  const transparentColor = vec4.zero(vec4.create())

  const colorize = (item: PianoNoteItem) => ({
    ...item,
    color: getColorForTrackId(item.trackId),
  })

  return (
    <>
      <NoteCircles
        strokeColor={transparentColor}
        rects={drumNotes.map(colorize)}
        zIndex={zIndex}
      />
      <NoteRectangles
        strokeColor={transparentColor}
        rects={normalNotes.map(colorize)}
        zIndex={zIndex + 0.1}
      />
    </>
  )
})
