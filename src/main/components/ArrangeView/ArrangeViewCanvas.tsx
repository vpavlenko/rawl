import Color from "color"
import { partition } from "lodash"
import { useState, useCallback, useEffect, VFC } from "react"
import { zeroRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { SolidRectangleObject2 } from "../../gl/shaders/SolidRectangleShader"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { ArrangeViewRenderer } from "./ArrangeViewRenderer"

export interface ArrangeViewCanvasProps {
  width: number
}

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = ({ width }) => {
  const rootStore = useStores()
  const theme = useTheme()

  const tracks = rootStore.song.tracks

  const {
    notes,
    cursorX,
    selection,
    selectionRect,
    trackHeight,
    contentWidth,
    transform,
    trackTransform,
    scrollLeft,
    scrollTop,
    scaleY,
    scrollBy,
    selectedTrackId,
    rulerStore: { beats },
  } = rootStore.arrangeViewStore

  const [renderer, setRenderer] = useState<ArrangeViewRenderer | null>(null)
  const [noteObject, setNoteObject] = useState<SolidRectangleObject2 | null>(
    null
  )

  const onCreateContext = useCallback((gl) => {
    const renderer = new ArrangeViewRenderer(gl)
    setRenderer(renderer)
    const noteObject = new SolidRectangleObject2(gl)
    renderer.scrollXYGroup.addChild(noteObject)
    setNoteObject(noteObject)
  }, [])

  useEffect(() => {
    noteObject?.updateBuffer(notes)
  }, [noteObject, notes])

  useEffect(() => {
    noteObject?.setProps({
      color: colorToVec4(Color(theme.themeColor)),
    })
  }, [noteObject, theme])

  useEffect(() => {
    if (renderer === null) {
      return
    }

    const [highlightedBeats, nonHighlightedBeats] = partition(
      beats,
      (b) => b.beat === 0
    )

    renderer.theme = theme
    renderer.render(
      cursorX,
      selectionRect ?? zeroRect,
      nonHighlightedBeats.map((b) => b.x),
      highlightedBeats.map((b) => b.x),
      tracks.map((_, i) => trackHeight * (i + 1) - 1),
      { x: scrollLeft, y: scrollTop }
    )
  }, [
    renderer,
    tracks.length,
    scrollLeft,
    scrollTop,
    cursorX,
    notes,
    beats,
    selectionRect,
  ])

  const height = trackHeight * tracks.length

  return (
    <GLCanvas
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    />
  )
}
