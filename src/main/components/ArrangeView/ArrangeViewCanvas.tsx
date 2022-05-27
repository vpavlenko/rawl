import Color from "color"
import { mat4, vec3 } from "gl-matrix"
import { useCallback, useMemo, useState, VFC } from "react"
import { IRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { SolidRectangleObject2 } from "../../gl/shaders/SolidRectangleShader"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
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

  const lineBuffer = useMemo(
    () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
    [tracks, width]
  )

  const color = colorToVec4(Color(theme.dividerColor))

  return (
    <Rectangles
      rects={lineBuffer}
      projectionMatrix={projectionMatrix}
      color={color}
    />
  )
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

  const [gl, setGL] = useState<WebGLRenderingContext | null>(null)
  const [noteObject, setNoteObject] = useState<SolidRectangleObject2 | null>(
    null
  )
  const [lineObject, setLineObject] = useState<SolidRectangleObject2 | null>(
    null
  )

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: gl?.canvas.height ?? 0,
  })

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
  const projectionMatrix = createProjectionMatrix()

  return (
    <GLSurface
      style={{ pointerEvents: "none" }}
      onCreateContext={onCreateContext}
      width={width}
      height={height}
    >
      <Lines
        width={gl?.canvas.width ?? 0}
        projectionMatrix={projectionMatrix}
      />
    </GLSurface>
  )
}
