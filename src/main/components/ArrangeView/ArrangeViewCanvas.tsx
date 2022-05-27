import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { partition } from "lodash"
import { useCallback, useMemo, useState, VFC } from "react"
import { IRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { BordererdRectangles } from "../GLSurface/BordererdRectangles"
import { GLSurface } from "../GLSurface/GLSurface"
import { Rectangles } from "../GLSurface/Rectangles"

export interface ArrangeViewCanvasProps {
  width: number
}

const Lines: VFC<{ width: number; projectionMatrix: mat4 }> = ({
  width,
  projectionMatrix,
}) => {
  const rootStore = useStores()
  const theme = useTheme()

  const { trackHeight } = rootStore.arrangeViewStore

  const tracks = rootStore.song.tracks

  const hline = (y: number): IRect => ({
    x: 0,
    y,
    width,
    height: 1,
  })

  const rects = useMemo(
    () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
    [tracks, width]
  )

  const color = colorToVec4(Color(theme.dividerColor))

  return (
    <Rectangles
      rects={rects}
      projectionMatrix={projectionMatrix}
      color={color}
    />
  )
}

const Beats: VFC<{ projectionMatrix: mat4; height: number }> = ({
  projectionMatrix,
  height,
}) => {
  const rootStore = useStores()
  const theme = useTheme()
  const {
    rulerStore: { beats },
  } = rootStore.arrangeViewStore

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height,
  })

  const [highlightedBeats, nonHighlightedBeats] = partition(
    beats,
    (b) => b.beat === 0
  )

  const lines = nonHighlightedBeats.map((b) => vline(b.x))
  const highlightedLines = highlightedBeats.map((b) => vline(b.x))

  const color = colorToVec4(Color(theme.dividerColor).alpha(0.2))
  const highlightedColor = colorToVec4(Color(theme.dividerColor).alpha(0.5))

  return (
    <>
      <Rectangles
        rects={lines}
        projectionMatrix={projectionMatrix}
        color={color}
      />
      <Rectangles
        rects={highlightedLines}
        projectionMatrix={projectionMatrix}
        color={highlightedColor}
      />
    </>
  )
}

const Notes: VFC<{ projectionMatrix: mat4 }> = ({ projectionMatrix }) => {
  const rootStore = useStores()
  const theme = useTheme()
  const { notes } = rootStore.arrangeViewStore

  return (
    <Rectangles
      rects={notes}
      projectionMatrix={projectionMatrix}
      color={colorToVec4(Color(theme.themeColor))}
    />
  )
}

const Selection: VFC<{ projectionMatrix: mat4 }> = ({ projectionMatrix }) => {
  const rootStore = useStores()
  const theme = useTheme()
  const { selectionRect } = rootStore.arrangeViewStore

  return (
    <>
      {selectionRect && (
        <BordererdRectangles
          rects={[selectionRect]}
          projectionMatrix={projectionMatrix}
          fillColor={vec4.create()}
          strokeColor={colorToVec4(Color(theme.themeColor))}
        />
      )}
    </>
  )
}

const Cursor: VFC<{ projectionMatrix: mat4; height: number }> = ({
  projectionMatrix,
  height,
}) => {
  const rootStore = useStores()
  const { cursorX } = rootStore.arrangeViewStore

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height,
  })

  const rect = vline(cursorX)

  const color = vec4.fromValues(1, 0, 0, 1)

  return (
    <Rectangles
      rects={[rect]}
      projectionMatrix={projectionMatrix}
      color={color}
    />
  )
}

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = ({ width }) => {
  const rootStore = useStores()
  const tracks = rootStore.song.tracks
  const { trackHeight } = rootStore.arrangeViewStore

  const [gl, setGL] = useState<WebGLRenderingContext | null>(null)

  const onCreateContext = useCallback((gl: WebGLRenderingContext) => {
    setGL(gl)
  }, [])

  const createProjectionMatrix = () => {
    if (gl === null) {
      return mat4.create()
    }
    const zNear = 0
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    const canvas = gl.canvas as HTMLCanvasElement

    const scale = canvas.clientWidth / canvas.width
    mat4.scale(
      projectionMatrix,
      projectionMatrix,
      vec3.fromValues(scale, scale, scale)
    )

    mat4.ortho(
      projectionMatrix,
      0,
      canvas.clientWidth,
      canvas.clientHeight,
      0,
      zNear,
      zFar
    )

    return projectionMatrix
  }

  const height = trackHeight * tracks.length
  const canvasWidth = gl?.canvas.width ?? 0
  const canvasHeight = gl?.canvas.height ?? 0
  const projectionMatrix = createProjectionMatrix()

  return (
    <GLSurface
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    >
      <Lines width={canvasWidth} projectionMatrix={projectionMatrix} />
      <Beats height={canvasHeight} projectionMatrix={projectionMatrix} />
      <Notes projectionMatrix={projectionMatrix} />
      <Selection projectionMatrix={projectionMatrix} />
      <Cursor height={canvasHeight} projectionMatrix={projectionMatrix} />
    </GLSurface>
  )
}
