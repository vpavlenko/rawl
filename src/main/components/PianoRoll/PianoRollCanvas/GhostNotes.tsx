import Color from "color"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { NoteCircles } from "./NoteCircles"
import { NoteRectangles } from "./NoteRectangles"

export const GhostNotes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    pianoRollStore: { ghostNotes: notes },
  } = useStores()
  const theme = useTheme()

  const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
  const baseColor = Color(theme.ghostNoteColor)
  const borderColor = baseColor.lighten(0.3)

  return (
    <>
      <NoteCircles
        fillColor={colorToVec4(baseColor)}
        strokeColor={colorToVec4(borderColor)}
        rects={drumNotes}
        zIndex={zIndex}
      />
      <NoteRectangles
        fillColor={colorToVec4(baseColor)}
        strokeColor={colorToVec4(borderColor)}
        rects={normalNotes}
        zIndex={zIndex + 0.1}
      />
    </>
  )
})
