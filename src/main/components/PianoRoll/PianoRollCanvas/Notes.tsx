import Color from "color"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { trackColorToCSSColor } from "../../../../common/track/TrackColor"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { NoteCircles } from "./NoteCircles"
import { NoteRectangles } from "./NoteRectangles"

export const Notes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    pianoRollStore: { notes, selectedTrack },
  } = useStores()
  const theme = useTheme()

  if (selectedTrack === undefined) {
    return <></>
  }

  const baseColor = Color(
    selectedTrack.color !== undefined
      ? trackColorToCSSColor(selectedTrack.color)
      : theme.themeColor,
  )
  const borderColor = colorToVec4(baseColor.lighten(0.3))
  const selectedColor = colorToVec4(baseColor.lighten(0.7))
  const backgroundColor = colorToVec4(Color(theme.backgroundColor))
  const baseColorVec4 = colorToVec4(baseColor)

  return (
    <>
      {selectedTrack.isRhythmTrack && (
        <NoteCircles
          strokeColor={borderColor}
          rects={notes}
          inactiveColor={backgroundColor}
          activeColor={baseColorVec4}
          selectedColor={selectedColor}
          zIndex={zIndex}
        />
      )}
      {!selectedTrack.isRhythmTrack && (
        <NoteRectangles
          strokeColor={borderColor}
          inactiveColor={backgroundColor}
          activeColor={baseColorVec4}
          selectedColor={selectedColor}
          rects={notes}
          zIndex={zIndex + 0.1}
        />
      )}
    </>
  )
})
