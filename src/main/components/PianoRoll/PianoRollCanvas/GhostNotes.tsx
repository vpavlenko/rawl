import Color from "color"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { trackColorToCSSColor } from "../../../../common/track/TrackColor"
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

  const getColorForTrackId = (trackId: number) => {
    const color = song.getTrack(trackId)?.color
    return colorToVec4(
      Color(
        color !== undefined
          ? trackColorToCSSColor(color)
          : theme.ghostNoteColor,
      ).mix(Color(theme.backgroundColor), 0.7),
    )
  }
  const borderColor = Color("transparent")

  const colorize = (item: PianoNoteItem) => ({
    ...item,
    color: getColorForTrackId(item.trackId),
  })

  return (
    <>
      <NoteCircles
        strokeColor={colorToVec4(borderColor)}
        rects={drumNotes.map(colorize)}
        zIndex={zIndex}
      />
      <NoteRectangles
        strokeColor={colorToVec4(borderColor)}
        rects={normalNotes.map(colorize)}
        zIndex={zIndex + 0.1}
      />
    </>
  )
})
