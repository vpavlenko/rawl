import Color from "color"
import { partition } from "lodash"
import { useCallback, useEffect, useMemo, useState, VFC } from "react"
import { IRect, zeroRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { SolidRectangleObject2 } from "../../gl/shaders/SolidRectangleShader"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLSolidRectangleNode } from "../GLSurface/GLSolidRectangleNode"
import { GLSurface } from "../GLSurface/GLSurface"
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
    selectionRect,
    trackHeight,
    scrollLeft,
    scrollTop,
    rulerStore: { beats },
  } = rootStore.arrangeViewStore

  const [renderer, setRenderer] = useState<ArrangeViewRenderer | null>(null)
  const [noteObject, setNoteObject] = useState<SolidRectangleObject2 | null>(
    null
  )
  const [lineObject, setLineObject] = useState<SolidRectangleObject2 | null>(
    null
  )

  const onCreateContext = useCallback((gl) => {
    const renderer = new ArrangeViewRenderer(gl)
    setRenderer(renderer)

    const noteObject = new SolidRectangleObject2(gl)
    renderer.scrollXYGroup.addChild(noteObject)
    setNoteObject(noteObject)

    const lineObject = new SolidRectangleObject2(gl)
    renderer.scrollYGroup.addChild(lineObject)
    setLineObject(lineObject)
  }, [])

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: renderer?.renderer.gl.canvas.height ?? 0,
  })

  const hline = (y: number): IRect => ({
    x: 0,
    y,
    width: renderer?.renderer.gl.canvas.width ?? 0,
    height: 1,
  })

  useEffect(() => {
    noteObject?.updateBuffer(notes)
    renderer?.renderer?.render()
  }, [noteObject, notes])

  useEffect(() => {
    noteObject?.setProps({
      color: colorToVec4(Color(theme.themeColor)),
    })
    lineObject?.setProps({
      color: colorToVec4(Color(theme.dividerColor)),
    })
    renderer?.renderer?.render()
  }, [noteObject, lineObject, theme, renderer])

  const lineBuffer = useMemo(
    () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
    [lineObject, tracks]
  )

  useEffect(() => {})

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
    <GLSurface
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    >
      <GLSolidRectangleNode buffer={[]} />
      <GLSolidRectangleNode buffer={lineBuffer} />
    </GLSurface>
  )
}
